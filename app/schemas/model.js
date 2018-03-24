'use strict';

module.exports = function() {
    return {
        "type": "object",
        "properties": {
            "modelName": {
                "type": "string",
                "pattern": "(^[A-Z]{1}$)|(^[A-Z][a-z0-9]+[A-Z]$)|(^[A-Z][a-z0-9]+([A-Z][a-z0-9]+)*$)|(^[A-Z][a-z0-9]+([A-Z][a-z0-9]+)+[A-Z]$)"
            },
            "id": {
                "type": "string",
                "enum": ["integer", "string"]
            },
            "fields": {
                "type": "object",
                "patternProperties": {
                    "^[a-z_$]+[a-zA-Z_$]*$": {
                        "type": "string",
                        "enum": ["boolean", "integer",  "number", "string"]
                    }
                },
                "additionalProperties": false  
            }
        },
        "required": ["modelName", "id"],
        "additionalProperties": false
    };
};


