local inventoryKey = KEYS[1]
local partySize = tonumber(ARGV[1])

local rawJson = redis.call("GET", inventoryKey)
if not rawJson then
    return -2
end

local inventory = cjson.decode(rawJson)
local optimalSize = -1
local candidateIndex = -1

for i, tableConfig in ipairs(inventory) do
    local size = tonumber(tableConfig.size)
    local total = tonumber(tableConfig.totalTables)
    local reserved = tonumber(tableConfig.reservedTables)
    
    if size >= partySize and reserved < total then
        if optimalSize == -1 or size < optimalSize then
            optimalSize = size
            candidateIndex = i
        end
    end
end

if optimalSize == -1 then
    return -1
end

inventory[candidateIndex].reservedTables = inventory[candidateIndex].reservedTables + 1

local updatedJson = cjson.encode(inventory)
redis.call("SET", inventoryKey, updatedJson, "KEEPTTL")

return optimalSize