local inventoryKey = KEYS[1]
local targetSize = tonumber(ARGV[1])

local rawJson = redis.call("GET", inventoryKey)
if not rawJson then
    return 0
end

local inventory = cjson.decode(rawJson)
for i, tableConfig in ipairs(inventory) do
    local size = tonumber(tableConfig.size)
    if size == targetSize and tonumber(tableConfig.reservedTables) > 0 then
        inventory[i].reservedTables = inventory[i].reservedTables - 1
        local updatedJson = cjson.encode(inventory)
        redis.call("SET", inventoryKey, updatedJson, "KEEPTTL")
        return 1
    end
end

return 0
