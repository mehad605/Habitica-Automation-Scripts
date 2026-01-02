// ==========================================

// CONFIGURATION

// ==========================================





const USER_ID = "";

const API_TOKEN = "";

const WEB_APP_URL = "";



// Equipment sets for each build

const EQUIPMENT_SETS = {

    "intelligence": {

        "weapon": "weapon_special_mammothRiderSpear",

        "armor": "armor_special_2",

        "head": "head_special_2",

        "shield": "shield_special_diamondStave",

        "back": "back_special_aetherCloak",

        "eyewear": "eyewear_special_aetherMask",

        "body": "body_special_aetherAmulet"

    },

    "perception": {

        "weapon": "weapon_special_2",

        "armor": "armor_armoire_woodElfArmor",

        "head": "head_special_clandestineCowl",

        "shield": "shield_special_goldenknight",

        "back": "back_special_aetherCloak",

        "eyewear": "eyewear_special_aetherMask",

        "body": "body_special_aetherAmulet"

    },

    "constitution": {

        "weapon": "weapon_special_skeletonKey",

        "armor": "armor_special_2",

        "head": "head_special_roguishRainbowMessengerHood",

        "shield": "shield_special_moonpearlShield",

        "back": "back_special_aetherCloak",

        "eyewear": "eyewear_special_aetherMask",

        "body": "body_special_aetherAmulet"

    },

    "strength": {

        "weapon": "weapon_special_2",

        "armor": "armor_special_finnedOceanicArmor",

        "head": "head_special_2",

        "shield": "shield_special_lootBag",

        "back": "back_special_aetherCloak",

        "eyewear": "eyewear_special_aetherMask",

        "body": "body_special_aetherAmulet"

    }

};



const HABITICA_API_BASE = 'https://habitica.com/api/v3';

const ROOT_URL = 'https://habitica.com/api/v3/user/equip/equipped/';



// ==========================================

// MAIN WEBHOOK LOGIC (FASTEST VERSION)

// ==========================================



function doPost(e) {

    // 1. Validations

    if (!e || !e.postData) return ContentService.createTextOutput("No data");



    try {

        const data = JSON.parse(e.postData.contents);

        

        // 2. Check if it's a reward event

        if (data.type === 'scored' && data.task && data.task.type === 'reward') {

            const rewardName = data.task.text.trim().toLowerCase();

            

            // 3. Find matching build

            for (const buildName of Object.keys(EQUIPMENT_SETS)) {

                if (rewardName === `${buildName} build`) {

                    // 4. Run the optimized switcher

                    equipGearFast(EQUIPMENT_SETS[buildName]);

                    break; 

                }

            }

        }

    } catch (error) {

        console.error("Webhook Error: " + error.toString());

    }



    // 5. Always return success fast

    return ContentService.createTextOutput(JSON.stringify({ status: 'success' }));

}



// ==========================================

// CORE FUNCTION

// ==========================================



function equipGearFast(targetGear) {

    const headers = {

        'x-api-user': USER_ID,

        'x-api-key': API_TOKEN,

        'x-client': USER_ID + '-GasFastScript'

    };



    // STEP 1: Get Current Gear

    // Essential to prevent "unequipping" items you are already wearing

    let currentGear = {};

    try {

        // Only fetch the specific field we need (saves bandwidth/time)

        const url = `${HABITICA_API_BASE}/user?userFields=items.gear.equipped`;

        const resp = UrlFetchApp.fetch(url, { headers: headers });

        currentGear = JSON.parse(resp.getContentText()).data.items.gear.equipped;

    } catch (e) {

        console.error("Failed to fetch gear. Aborting safely.");

        return;

    }



    // STEP 2: Calculate Differences

    let requests = [];

    for (const [slot, targetKey] of Object.entries(targetGear)) {

        // Skip if:

        // A) The target is empty

        // B) The target is the base/empty shield

        // C) We are ALREADY wearing this exact item (prevents toggle/unequip)

        if (!targetKey || targetKey === 'shield_base_0' || currentGear[slot] === targetKey) {

            continue;

        }



        requests.push({

            url: `${ROOT_URL}${targetKey}`,

            method: 'post',

            headers: headers,

            muteHttpExceptions: true

        });

    }



    // STEP 3: Fire Requests (Parallel)

    if (requests.length > 0) {

        console.log(`Updating ${requests.length} items...`);

        // fetchAll sends all requests at the exact same time

        UrlFetchApp.fetchAll(requests);

        console.log("Update complete.");

    } else {

        console.log("Gear is already correct.");

    }

}



// ==========================================

// SETUP TOOLS (Run manually if needed)

// ==========================================



function setupWebhook() {

    if (!WEB_APP_URL || WEB_APP_URL.includes("/dev")) {

        console.error("Error: set WEB_APP_URL to your '/exec' URL first.");

        return;

    }



    const url = `${HABITICA_API_BASE}/user/webhook`;

    const payload = {

        url: WEB_APP_URL,

        label: "Fast Gear Switcher",

        type: "taskActivity",

        options: { scored: true }

    };



    const params = {

        method: 'post',

        headers: {

            'x-api-user': USER_ID,

            'x-api-key': API_TOKEN,

            'Content-Type': 'application/json',

            'x-client': USER_ID + '-GasSetup'

        },

        payload: JSON.stringify(payload)

    };



    try {

        const resp = UrlFetchApp.fetch(url, params);

        console.log("Webhook Connected! Status: " + resp.getResponseCode());

    } catch (e) {

        console.error("Error connecting webhook: " + e);

    }

}



function getMyGearKeys() {

    const url = `${HABITICA_API_BASE}/user?userFields=items.gear.equipped`;

    const params = {

        headers: { 'x-api-user': USER_ID, 'x-api-key': API_TOKEN }

    };

    const response = JSON.parse(UrlFetchApp.fetch(url, params).getContentText());

    console.log(JSON.stringify(response.data.items.gear.equipped, null, 2));

}