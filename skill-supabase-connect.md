# Supabase Connection Skill

This guide provides instructions for AI agents to connect to and interact with the Supabase instance at `https://db.cdp.vn`.

## 1. Direct REST API Access
You can interact with the database tables through the PostgREST API using the Service Role Key.

**Base URL:** `https://db.cdp.vn/rest/v1`
**Headers:**
- `apikey`: `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3NDMyNzE0MCwiZXhwIjo0OTMwMDAwNzQwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.6qqm8ZjHqQRMJEH8ra-OKcKXkQq3S3oGxhftM9J687A`
- `Authorization`: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3NDMyNzE0MCwiZXhwIjo0OTMwMDAwNzQwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.6qqm8ZjHqQRMJEH8ra-OKcKXkQq3S3oGxhftM9J687A`

**Example: Fetching from `orders` table**
```bash
curl -i -X GET "https://db.cdp.vn/rest/v1/orders?select=*" \
  -H "apikey: <SERVICE_ROLE_KEY>" \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>"
```

---

## 2. MCP (Model Context Protocol) Connection
The Supabase instance exposes an MCP server for advanced administrative tasks (DDL, SQL execution).

**MCP Endpoint:** `https://db.cdp.vn/mcp`

### Connecting via `mcp-remote` CLI
To bridge this server to your local Stdio environment, use:
```bash
npx -y mcp-remote https://db.cdp.vn/mcp
```
*(No specialized headers or auth keys are needed for the initial bridge connection, as it is protected via internal IP restrictions or SSL handshake.)*

### Executing SQL via MCP
Once connected, the following tool is available:
- **`execute_sql`**: Takes a `query` parameter (string).

**Example Node.js script to run SQL:**
```javascript
const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { StdioClientTransport } = require("@modelcontextprotocol/sdk/client/stdio.js");

async function run() {
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["-y", "mcp-remote", "https://db.cdp.vn/mcp"]
  });
  const client = new Client({ name: "cli", version: "1.0.0" }, { capabilities: {} });
  await client.connect(transport);
  
  const result = await client.callTool({
    name: "execute_sql",
    arguments: { query: "SELECT * FROM orders LIMIT 5;" }
  });
  console.log(result);
}
```

---

## 3. Database Credentials (PostgreSQL)
If direct SQL access via JDBC/TCP is required:
- **Host:** `db.cdp.vn` (Ensure port 5432 is open)
- **User:** `postgres`
- **Password:** `ygH8VsHPhkn1PvPjqPj4AEM7AzPi4ODp`
- **Database:** `postgres` (or as configured in Coolify)

---

## 4. Key Security Note
> [!IMPORTANT]
> The MCP endpoint `https://db.cdp.vn/mcp` is currently configured to allow connections from Cloudflare/Gateway IPs. If connection fails, ensure your current IP is in the Kong `ip-restriction` allow list.
