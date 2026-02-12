#!/bin/bash
BASE_URL="http://localhost:3000/api"

echo "1. Checking Initial Stock for Balle Neon (ID 2)..."
# Use jq to find the item with id_gadget 2 and get its quantite_disponible
initial_stock=$(curl -s "$BASE_URL/stocks" | jq -r '.[] | select(.id_gadget == 2) | .quantite_disponible')
echo "Initial Stock: $initial_stock"

if [ -z "$initial_stock" ]; then
    echo "❌ Failed to fetch initial stock. Is the server running?"
    exit 1
fi

echo "2. Performing Sale (1x Balle Neon)..."
sale_response=$(curl -s -X POST "$BASE_URL/sales" \
  -H "Content-Type: application/json" \
  -d '{"items": [{"id_gadget": 2, "quantity": 1}]}')
echo "Sale response: $sale_response"

echo "3. Checking Updated Stock..."
new_stock=$(curl -s "$BASE_URL/stocks" | jq -r '.[] | select(.id_gadget == 2) | .quantite_disponible')
echo "New Stock: $new_stock"

expected_stock=$((initial_stock - 1))

if [ "$new_stock" -eq "$expected_stock" ]; then
    echo "✅ Stock updated correctly from $initial_stock to $new_stock!"
else
    echo "❌ Stock update failed! Expected $expected_stock, got $new_stock"
fi

echo "4. Checking Dashboard Stats..."
curl -s "$BASE_URL/dashboard/stats" | jq .
