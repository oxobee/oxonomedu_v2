#!/usr/bin/env bash
# Helper script to interact with 21st.dev MCP API
API_KEY="${TWENTYFIRST_API_KEY:-21st_sk_41eb6f9603e548b29559aee74ec62da6196feeb78f03f98b4e17de45424cc5df}"
ENDPOINT="https://21st.dev/api/mcp"

CMD="${1:-help}"

case "$CMD" in
  tools|list)
    curl -s -X POST "$ENDPOINT" \
      -H "Content-Type: application/json" \
      -H "x-api-key: $API_KEY" \
      -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}' | python3 -c '
import sys, json
data = json.load(sys.stdin)
tools = data.get("result", {}).get("tools", [])
print("Total tools:", len(tools))
for t in tools:
    n = t.get("name")
    title = t.get("title", "")
    print("- " + str(n) + ": " + str(title))
'
    ;;
  usage)
    curl -s -X POST "$ENDPOINT" \
      -H "Content-Type: application/json" \
      -H "x-api-key: $API_KEY" \
      -d '{"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": "get_usage", "arguments": {}}}' | python3 -c '
import sys, json
data = json.load(sys.stdin)
for c in data.get("result", {}).get("content", []):
    print(c.get("text", ""))
'
    ;;
  search)
    QUERY="${2:-button}"
    curl -s -X POST "$ENDPOINT" \
      -H "Content-Type: application/json" \
      -H "x-api-key: $API_KEY" \
      -d "{\"jsonrpc\": \"2.0\", \"id\": 3, \"method\": \"tools/call\", \"params\": {\"name\": \"search\", \"arguments\": {\"query\": \"$QUERY\", \"limit\": 5}}}" | python3 -c '
import sys, json
data = json.load(sys.stdin)
for c in data.get("result", {}).get("content", []):
    print(c.get("text", ""))
'
    ;;
  get)
    ID="$2"
    if [ -z "$ID" ]; then
      echo "Usage: ./scripts/21st.sh get <component_id>"
      exit 1
    fi
    curl -s -X POST "$ENDPOINT" \
      -H "Content-Type: application/json" \
      -H "x-api-key: $API_KEY" \
      -d "{\"jsonrpc\": \"2.0\", \"id\": 4, \"method\": \"tools/call\", \"params\": {\"name\": \"get_component\", \"arguments\": {\"id\": $ID}}}"
    ;;
  *)
    echo "21st.dev MCP Helper"
    echo "Usage: ./scripts/21st.sh [tools|usage|search <query>|get <id>]"
    ;;
esac
