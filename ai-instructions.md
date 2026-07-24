# Nova Browser AI Integration Guide

Nova Browser features a built-in MCP (Model Context Protocol) server that allows AI assistants like Claude Desktop, Cursor, and Windsurf to completely control the browser (navigate, read pages, click, type, and take screenshots).

## Prerequisites
- Node.js (v18+)
- Nova Browser must be open and running

## Connecting to Claude Desktop

Claude Desktop natively uses standard input/output (Stdio) to connect to local MCP servers. Since Nova Browser runs its MCP server using SSE (Server-Sent Events) on port 3020, we have provided a universal bridge script.

### 1. Build the Bridge Script (if not built)
In the Nova Browser directory, run:
```bash
npx esbuild mcp-bridge.ts --bundle --platform=node --external:@modelcontextprotocol/sdk --external:eventsource --format=esm --outfile=mcp-bridge.mjs
```

### 2. Update Claude Desktop Config
Open your Claude Desktop config file:
- **Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

Add the Nova Browser bridge configuration:

```json
{
  "mcpServers": {
    "nova-browser": {
      "command": "node",
      "args": ["/ABSOLUTE_PATH_TO_YOUR_PROJECT/open source browser/mcp-bridge.mjs"]
    }
  }
}
```
*(Make sure to replace `/ABSOLUTE_PATH_TO_YOUR_PROJECT/...` with the actual absolute path to where you downloaded Nova Browser)*

### 3. Restart Claude
Restart the Claude Desktop application. 

### 4. Test It!
You can now ask Claude things like:
- *"Nova Browser'ı kullanarak google.com'a git ve ekran görüntüsünü al."*
- *"Açık olan tüm sekmelerimi listele."*
- *"Şu an bulunduğum sayfadaki metni oku ve özetle."*

## Connecting to Cursor
Cursor'un ayarlar menüsünde (Settings > Features > MCP) yer alan bölüme gidin ve "+ Add New MCP Server" butonuna tıklayın.
- **Name:** Nova Browser
- **Command:** `node /ABSOLUTE_PATH_TO_YOUR_PROJECT/open source browser/mcp-bridge.mjs`

## Troubleshooting
- If the AI complains about connection errors, ensure Nova Browser is actually open. The bridge (`mcp-bridge.mjs`) only works when the browser's built-in `localhost:3020/mcp` server is running.
