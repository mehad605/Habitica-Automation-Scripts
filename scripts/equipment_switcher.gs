// ==========================================
// CONFIGURATION
// ==========================================

const USER_ID = "";
const API_TOKEN = "";
const WEB_APP_URL = "";

const SEND_LOG_EMAIL = false;
const EMAIL_ADDRESS = "";

// Equipment sets for each build
// Add more builds by adding new keys with their equipment
const EQUIPMENT_SETS = {
    "intelligence": {
        "weapon": "weapon_special_winter2026Mage",
        "armor": "armor_special_winter2026Mage",
        "head": "head_special_winter2026Mage"
    },
    "perception": {
        "weapon": "",
        "armor": "",
        "head": ""
    },
    "constitution": {
        "weapon": "",
        "armor": "",
        "head": ""
    },
    "strength": {
        "weapon": "",
        "armor": "",
        "head": ""
    }
};

const ROOT_URL = 'https://habitica.com/api/v3/user/equip/equipped/';
const HABITICA_API_BASE = 'https://habitica.com/api/v3';

// ==========================================
// MAIN WEBHOOK LOGIC
// ==========================================

function doPost(e) {
    let logMessage = "LOG START\n";

    try {
        if (!e || !e.postData) {
            logMessage += "Error: No postData received\n";
            sendLogEmail(logMessage);
            return;
        }

        const data = JSON.parse(e.postData.contents);
        logMessage += `Event Type: ${data.type}\n`;

        if (data.type === 'scored' && data.task && data.task.type === 'reward') {
            const rewardName = data.task.text.trim().toLowerCase();
            logMessage += `Reward Name: '${data.task.text}'\n`;

            let buildFound = false;
            for (const [buildName, gearSet] of Object.entries(EQUIPMENT_SETS)) {
                const expectedRewardName = `${buildName} build`;

                if (rewardName === expectedRewardName) {
                    logMessage += `Match found: ${buildName}\n`;
                    equipGearSafe(gearSet);
                    logMessage += `Gear switch completed for ${buildName}\n`;
                    buildFound = true;
                    break;
                }
            }

            if (!buildFound) {
                logMessage += "No matching build found\n";
            }
        } else {
            logMessage += "Ignored: Not a scored reward event\n";
        }

    } catch (error) {
        logMessage += `Error: ${error.toString()}\n`;
    }

    sendLogEmail(logMessage);
    return ContentService.createTextOutput(JSON.stringify({ status: 'success' }));
}


function sendLogEmail(body) {
    if (!SEND_LOG_EMAIL) return;

    const emailTo = EMAIL_ADDRESS || Session.getActiveUser().getEmail();

    MailApp.sendEmail({
        to: emailTo,
        subject: "Habitica Script Log",
        body: body
    });
    console.log("Email sent to " + emailTo);
}

// ==========================================
// GEAR EQUIPMENT FUNCTION
// ==========================================

function equipGearSafe(gearList) {
    for (const [slot, key] of Object.entries(gearList)) {
        if (!key || key === 'shield_base_0') {
            console.log(`Skipping ${slot} (Key: ${key})`);
            continue;
        }

        const specificUrl = ROOT_URL + key;
        const params = {
            method: 'post',
            headers: {
                'x-api-user': USER_ID,
                'x-api-key': API_TOKEN,
                'Content-Type': 'application/json',
                'x-client': USER_ID + '-GasGearScript'
            },
            muteHttpExceptions: true
        };

        const response = UrlFetchApp.fetch(specificUrl, params);

        if (response.getResponseCode() === 200) {
            console.log(`Success: Equipped ${key}`);
        } else {
            console.log(`Failed (${response.getResponseCode()}): ${key}`);
            console.log(`Error: ${response.getContentText()}`);
        }
    }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function setupWebhook() {
    if (WEB_APP_URL.includes("/dev")) {
        console.error("Error: Use '/exec' URL from Manage Deployments, not '/dev'");
        return;
    }

    const url = `${HABITICA_API_BASE}/user/webhook`;
    const payload = {
        url: WEB_APP_URL,
        label: "Gear Switcher Script",
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
        console.log("Habitica is now sending data to: " + WEB_APP_URL);
    } catch (e) {
        console.error("Error connecting webhook: " + e);
    }
}

function getMyGearKeys() {
    const url = `${HABITICA_API_BASE}/user?userFields=items.gear.equipped`;
    const params = {
        headers: {
            'x-api-user': USER_ID,
            'x-api-key': API_TOKEN,
            'x-client': USER_ID + '-GasKeyFinder'
        }
    };

    const response = JSON.parse(UrlFetchApp.fetch(url, params).getContentText());
    console.log("Copy this into your EQUIPMENT_SETS:");
    console.log(JSON.stringify(response.data.items.gear.equipped, null, 2));
}

function testEmail() {
    sendLogEmail("Test email to verify permissions");
}

function testGearSwitch(buildName = "intelligence") {
    console.log(`Testing gear switch for: ${buildName}`);

    if (!EQUIPMENT_SETS[buildName]) {
        console.error(`Build '${buildName}' not found`);
        return;
    }

    equipGearSafe(EQUIPMENT_SETS[buildName]);
    console.log("Test complete. Check Habitica avatar.");
}

function createBuildRewards() {
    const url = `${HABITICA_API_BASE}/tasks/user`;

    for (const buildName of Object.keys(EQUIPMENT_SETS)) {
        const rewardData = {
            text: `${buildName} build`,
            type: "reward",
            value: 0,
            notes: `equips gears that have most ${buildName}`
        };

        const params = {
            method: 'post',
            headers: {
                'x-api-user': USER_ID,
                'x-api-key': API_TOKEN,
                'Content-Type': 'application/json',
                'x-client': USER_ID + '-GasRewardCreator'
            },
            payload: JSON.stringify(rewardData),
            muteHttpExceptions: true
        };

        try {
            const response = UrlFetchApp.fetch(url, params);
            if (response.getResponseCode() === 201) {
                console.log(`Created reward: ${buildName} build`);
            } else {
                console.error(`Failed to create ${buildName} build: ${response.getContentText()}`);
            }
        } catch (e) {
            console.error(`Error creating ${buildName} build: ${e}`);
        }
    }

    console.log("Reward creation complete!");
}