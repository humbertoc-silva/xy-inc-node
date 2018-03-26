'use strict';

module.exports =  {
    "type": "object",
    "properties": {
    	"id": {
    		"type": "object",
            "properties": {
                "type": { 
                  	"type": "string",
                    "enum": ["integer", "string"]
                }
            },
            "required": ["type"],
    		"additionalProperties": false
    	}
	},
    "patternProperties": {
    	"^[a-z_$]+[a-zA-Z_$]*$": {
        	"type": "object",
            "properties": {
            	"type": { 
                  	"type": "string",
                    "enum": ["boolean", "integer",  "number", "string"]
                }
            },
            "required": ["type"],
    		"additionalProperties": false
        }
    },
    "required": ["id"],
    "additionalProperties": false
};