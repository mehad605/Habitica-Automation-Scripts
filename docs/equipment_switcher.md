# Equipment Switcher - Setup Guide

This script automatically switches your Habitica equipment sets when you buy specific rewards.

## Setup Instructions

### 1. Create Google Apps Script Project

1. Go to https://script.google.com/home
2. Click **New project**
3. Give it a name (e.g., "Habitica Equipment Switcher")
4. In the `code.gs` file, remove all existing code
5. Paste the code from `equipment_switcher.gs`

### 2. Configure API Credentials

1. Go to https://habitica.com/user/settings/siteData
2. Copy your **User ID** and **API Token** (click "Show API Token" if needed)
3. Paste them into the script:
   ```javascript
   const USER_ID = "your-user-id-here";
   const API_TOKEN = "your-api-token-here";
   ```

### 3. Deploy the Script

1. Click the blue **Deploy** button (top right)
2. Click **New deployment**
3. Click the gear icon next to "Select type"
4. Select **Web app**
5. Configure the deployment:
   - **Description**: "Equipment Switcher" (optional)
   - **Execute as**: Me
   - **Who has access**: **Anyone**
6. Click **Deploy**

### 4. Authorize the Script

1. Click **Authorize access**
2. Select your Google account
3. You'll see a warning "Google hasn't verified this app" - this is normal for personal scripts
4. Click **Advanced** → **Go to [project name] (unsafe)**
5. Grant the requested permissions
6. Copy the **Web App URL** that appears (it ends with `/exec`)
7. Paste it into the script:
   ```javascript
   const WEB_APP_URL = "your-web-app-url-here";
   ```
8. **Save** the script (Ctrl+S or File → Save)

### 5. Setup Equipment Sets

For each build you want to create:

1. Go to Habitica and **manually equip** the gear for that build
2. In Google Apps Script, select **getMyGearKeys** from the function dropdown at the top
3. Click **Run** (authorize if prompted)
4. View the execution log (Ctrl+Enter or View → Logs)
5. Copy the output, which looks like:
   ```javascript
   {
     "weapon": "weapon_special_mammothRiderSpear",
     "armor": "armor_special_2",
     "head": "head_special_2",
     "shield": "shield_special_diamondStave",
     "back": "back_special_aetherCloak",
     "eyewear": "eyewear_special_aetherMask",
     "body": "body_special_aetherAmulet"
   }
   ```
6. Paste this into the appropriate build in `EQUIPMENT_SETS` (e.g., "intelligence", "perception", "constitution", or "strength")

![alt text](../images/image.png)

7. Repeat for all your builds you want to configure

Mine looks something like this:

![alt text](../images/image-1.png)

**Note**: Your values will be different based on what equipment you own and choose to equip.

### 6. Connect Webhook

1. Select **setupWebhook** from the function dropdown
2. Click **Run**
3. Check the execution log - you should see:
   ```
   Webhook Connected! Status: 200
   ```

### 7. Create Habitica Rewards

You need to **manually create rewards** in Habitica for each build:

1. Go to https://habitica.com
2. In the Rewards column, click the + button to add a new reward
3. For each build in your `EQUIPMENT_SETS`, create a reward with **exactly** this naming format:
   - **intelligence build** (for the intelligence build)
   - **perception build** (for the perception build)
   - **constitution build** (for the constitution build)
   - **strength build** (for the strength build)
4. Set the gold cost to whatever you prefer (e.g., 0 gold for free switching)
5. Add a description if desired (optional)

**Important**: The reward name must be lowercase and match the build name exactly, followed by " build".

### 8. Redeploy (Final Step)

1. Click **Deploy** → **Manage deployments**
2. Click the pencil icon (edit)
3. Under **Version**, select **New version**
4. Click **Deploy**
5. Click **Done**

## Usage

Once setup is complete:

1. Go to Habitica
2. Buy the reward for the build you want (e.g., "intelligence build", "perception build")
3. Your equipment will automatically switch to that build!

The script is optimized for speed and will only switch equipment pieces that are different from what you're currently wearing.

## Adding More Builds

To add more equipment sets:

1. Add a new key to `EQUIPMENT_SETS` in the script with your desired build name
2. Follow step 5 from the setup instructions to get the gear keys
3. Create a matching reward in Habitica (e.g., if your build is named "my_custom_build", create a reward called "my_custom_build build")
4. Redeploy the script (step 8)

## Troubleshooting

### Equipment doesn't switch
- Check the execution log in Google Apps Script (View → Executions)
- Make sure the reward name **exactly matches** the pattern: `[buildname] build` (all lowercase)
- Verify your `WEB_APP_URL` is set correctly (should end with `/exec`, not `/dev`)
- Make sure you redeployed after making changes

### Webhook not connecting
- Ensure your `WEB_APP_URL` is the `/exec` URL, not `/dev`
- Run `setupWebhook` again
- Check that "Who has access" is set to **Anyone** in the deployment settings

### Script authorization issues
- Try reauthorizing: Run → Clear all authorizations, then run a function again
- Make sure you clicked "Advanced" and allowed the unsafe app

## How It Works

The script uses webhooks to listen for reward purchases in Habitica. When you buy a reward with a name matching one of your builds (e.g., "intelligence build"), it:

1. Fetches your currently equipped gear
2. Compares it to the target build
3. Only switches the equipment pieces that are different
4. Uses parallel API requests for maximum speed

This optimized approach prevents unnecessary API calls and avoids accidentally unequipping items you're already wearing.
