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
2. Copy your **User ID** and **API Token** (click "Learn more" beside API Token if needed)
3. Paste them into the script:
   ```javascript
   const USER_ID = "your-user-id-here";
   const API_TOKEN = "your-api-token-here";
   ```

### 3. Configure Email Settings

- Set `SEND_LOG_EMAIL` to `true` if you want email notifications, otherwise `false`
- Set `EMAIL_ADDRESS` to a specific email, or leave blank to use your Google account email

### 4. Deploy the Script

1. Click the blue **Deploy** button
2. Click **New deployment**
3. Click the gear icon to configure deployment
4. Select **Web app**
5. In "Who has access", select **Anyone**
6. Click **Deploy**

### 5. Authorize the Script

1. Click **Authorize access**
2. Select your Gmail account
3. You'll see a warning "Google hasn't verified this app" - this is normal for personal scripts
4. Click **Advanced** → **Go to [project name] (unsafe)**
5. Grant the requested permissions
6. You may see "This page isn't working" or "Bad request 400" - close it and continue
7. Copy the **Web App URL** from the deployment screen
8. Paste it into the script:
   ```javascript
   const WEB_APP_URL = "your-web-app-url-here";
   ```
9. **Save** the script

### 6. Setup Equipment Sets

For each build you want to create:

1. Go to Habitica and **manually equip** the gear for that build
2. In Google Apps Script, select **getMyGearKeys** from the dropdown at the top
3. Click **Run** (authorize if prompted)
4. Copy the output from the execution log, which looks like:
   ```javascript
   {
     "weapon": "weapon_special_mammothRiderSpear",
     "armor": "armor_special_2",
     "head": "head_special_2",
     "shield": "shield_special_diamondStave",
     "eyewear": "eyewear_special_aetherMask",
     "body": "body_special_aetherAmulet"
   }
   ```
5. Paste this into the appropriate build in `EQUIPMENT_SETS` (e.g., "intelligence", "perception", etc.)
![alt text](../images/image.png)
In your case the values may be different based on what you equipped manually.

6. Repeat for all your builds
Mine looks something like this:
![alt text](../images/image-1.png)
Remember this may be different from yours because of what equipments you have or choose.

### 7. Connect Webhook

1. Select **setupWebhook** from the dropdown
2. Click **Run** (authorize if prompted)
3. You should see in the execution log:
   ```
   Webhook Connected! Status: 201
   Habitica is now sending data to: [your-web-app-url]
   ```

### 8. Create Habitica Rewards

1. Select **createBuildRewards** from the dropdown
2. Click **Run**
3. This will automatically create rewards in Habitica for each build

### 9. Redeploy

1. Click **Deploy** → **Manage deployments**
2. Click the pencil icon (edit)
3. Click **Version** → **New version**
4. Click **Deploy** → **Done**

## Usage

Once setup is complete:

1. Go to Habitica
2. Buy the reward for the build you want (e.g., "intelligence build", "perception build")
3. Your equipment will automatically switch!

## Adding More Builds

To add more equipment sets:

1. Add a new key to `EQUIPMENT_SETS` in the script
2. Follow steps 6-9 from the setup instructions
3. The reward will be created automatically when you run `createBuildRewards()`

## Troubleshooting

- If equipment doesn't switch, check the execution log in Google Apps Script
- If you have email logging enabled, check your email for error messages
- Make sure your webhook is properly connected by running `setupWebhook` again
