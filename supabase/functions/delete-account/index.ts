import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

type StorageAdminClient = {
  storage: {
    listBuckets: () => Promise<{ data: { name: string }[] | null; error: { message: string } | null }>;
    from: (bucket: string) => {
      list: (
        path: string,
        options: { limit: number }
      ) => Promise<{ data: { name: string }[] | null; error: { message: string } | null }>;
      remove: (paths: string[]) => Promise<{ error: { message: string } | null }>;
    };
  };
};

async function removeUserStorageObjects(
  admin: StorageAdminClient,
  userId: string
): Promise<{ error: string | null }> {
  const { data: buckets, error: bucketsError } = await admin.storage.listBuckets();
  if (bucketsError) return { error: bucketsError.message };

  for (const bucket of buckets ?? []) {
    const prefix = `${userId}/`;
    const { data: objects, error: listError } = await admin.storage.from(bucket.name).list(userId, {
      limit: 1000,
    });
    if (listError) {
      // Bucket may not use userId prefixes — skip rather than fail the whole deletion.
      continue;
    }
    if (!objects?.length) continue;

    const paths = objects.map((obj: { name: string }) => `${prefix}${obj.name}`);
    const { error: removeError } = await admin.storage.from(bucket.name).remove(paths);
    if (removeError) return { error: removeError.message };
  }

  return { error: null };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return jsonResponse({ error: "Missing authorization." }, 401);
  }

  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    if ("userId" in record || "user_id" in record) {
      return jsonResponse({ error: "Client-supplied user id is not allowed." }, 400);
    }
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return jsonResponse({ error: "Server configuration error." }, 500);
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user?.id) {
    return jsonResponse({ error: "Invalid or expired session." }, 401);
  }

  const userId = user.id;
  const admin = createClient(supabaseUrl, serviceRoleKey);

  const storageResult = await removeUserStorageObjects(admin, userId);
  if (storageResult.error) {
    return jsonResponse({ error: `Could not remove stored files: ${storageResult.error}` }, 500);
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
  if (deleteError) {
    return jsonResponse({ error: deleteError.message }, 500);
  }

  return jsonResponse({ success: true }, 200);
});
