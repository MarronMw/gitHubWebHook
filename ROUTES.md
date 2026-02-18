# USSD Route Guideline - MkhondeWallet

## Overview

USSD routing for MkhondeWallet application. The flow is controlled via the `text` parameter which represents the navigation path using numeric selections separated by asterisks (`*`).

---

## Request/Response Format

### Request Format

```json
{
  "sessionId": "unique_session_id",
  "networkCode": "MZ01",
  "phoneNumber": "+265701234567",
  "text": "0*2"
}
```

### Response Format

**CON** (Continue Session):

```
CON Welcome to MkhondeWallet
0. Groups
1. My account
2. Chichewa
```

**END** (End Session):

```
END Your phone number is 0701234567 (John Doe)
```

---

## Route Flow Map

### INITIAL MENU (Entry Point)

**Input:** `text == ""` or `text == "2*2"`

**Navigation Code:** Root menu

**Display:**

```
CON Welcome to MkhondeWallet
0. Groups
1. My account
2. Chichewa
```

**Options:**

- Press `0` → Go to Groups Menu
- Press `1` → Go to My Account
- Press `2` → Switch to Chichewa (Language)

---

### GROUPS MENU

**Input:** `text == "0"` or `text == "2*0"`

**Navigation Path:** `0` from Initial Menu OR `2*0` when in Chichewa

**Display (English):**

```
CON Groups
1. Join a Group
2. My Groups
3. Create a Group
```

**Display (Chichewa):**

```
CON Magulu
1. Lowani mu gulu
2. Magulu anga
3. Pangani gulu
```

**Options:**

- Press `1` → Join a Group
- Press `2` → My Groups
- Press `3` → Create a Group

---

### MY GROUPS

**Input:** `text == "0*2"` or `text == "2*0*2"`

**Navigation Path:** Groups → My Groups

**Database Query:** Fetches user's groups from `group_members` table

**Display (English):**

```
CON My Groups
1. Group Name 1
2. Group Name 2
3. Group Name 3
```

**Display (Chichewa):**

```
CON Magulu anga
1. Dzina la Gulu 1
2. Dzina la Gulu 2
3. Dzina la Gulu 3
```

**Error Response:**

```
END You are not a member of any groups.
```

**Data Source:**

```sql
SELECT group_id(name), user_id!inner(full_name, phone_number)
FROM group_members
WHERE user_id.phone_number = '0701234567'
```

---

### MY ACCOUNT MENU

**Input:** `text == "1"` or `text == "2*1"`

**Navigation Path:** Initial Menu → My Account

**Display (English):**

```
CON Choose account information you want to view
1. Account number
2. Phone number
```

**Display (Chichewa):**

```
CON Sankhani zomwe mukufuna kuwona
1. Nambala ya akaunti
2. Nambala ya foni
```

**Options:**

- Press `1` → View Account Number
- Press `2` → View Phone Number

---

### ACCOUNT NUMBER

**Input:** `text == "1*1"` or `text == "2*1*1"`

**Navigation Path:** My Account → Account Number

**Display (English):**

```
END Your account number is MKHONDE[random]
```

**Display (Chichewa):**

```
END Nambala ya akaunti yanu ndi MKHONDE[random]
```

**Generation:** `MKHONDE${Math.random()}`

**Session Ends:** YES (END prefix)

---

### PHONE NUMBER

**Input:** `text == "1*2"` or `text == "2*1*2"`

**Navigation Path:** My Account → Phone Number

**Database Query:** Fetches user info from `users` table

**Display (English):**

```
END Your phone number is 0701234567 (John Doe)
```

**Display (Chichewa):**

```
END Nambala ya foni yanu ndi 0701234567 (John Doe)
```

**Data Source:**

```sql
SELECT full_name, phone_number
FROM users
WHERE phone_number = '0701234567'
```

**Error Response:**

```
END Your phone number is not registered.
```

**Session Ends:** YES (END prefix)

---

### CHICHEWA LANGUAGE SWITCH

**Input:** `text == "2"`

**Navigation Path:** Initial Menu → Chichewa

**Display:**

```
CON Takulandirani ku MkhondeWallet
0. Magulu
1. Akaunti yanga
2. Chingerezi
```

**Effect:** All subsequent menus display in Chichewa

- Append `*2` to navigation path for Chichewa menus
- Example: `0*2` = Groups menu in Chichewa

---

## Complete Navigation Paths

| Path       | Description        | Language                  |
| ---------- | ------------------ | ------------------------- |
| `` (empty) | Initial Menu       | English                   |
| `0`        | Groups Menu        | English                   |
| `1`        | My Account         | English                   |
| `2`        | Switch to Chichewa | -                         |
| `0*1`      | Join a Group       | English                   |
| `0*2`      | My Groups          | English                   |
| `0*3`      | Create a Group     | English                   |
| `1*1`      | Account Number     | English                   |
| `1*2`      | Phone Number       | English                   |
| `2`        | Initial Menu       | Chichewa                  |
| `2*0`      | Groups Menu        | Chichewa                  |
| `2*1`      | My Account         | Chichewa                  |
| `2*2`      | Switch to English  | (Returns to Initial Menu) |
| `2*0*1`    | Join a Group       | Chichewa                  |
| `2*0*2`    | My Groups          | Chichewa                  |
| `2*0*3`    | Create a Group     | Chichewa                  |
| `2*1*1`    | Account Number     | Chichewa                  |
| `2*1*2`    | Phone Number       | Chichewa                  |

---

## Session Management

### Phone Number Processing

- Incoming: `+265701234567` (international format)
- Converted to: `0701234567` (local format)
- Used for database lookups

### Response Types

- **CON** - Session continues, user can select next option
- **END** - Session terminates, no further input accepted

### Session Termination

Sessions end when:

1. User receives an `END` response
2. Session timeout (handled by carrier)
3. User hangs up

---

## Database Queries

### Queries Used

**1. Fetch User's Groups**

```javascript
const { data, error } = await supabase
  .from("group_members")
  .select("group_id(name), user_id!inner(full_name, phone_number)")
  .eq("user_id.phone_number", number);
```

**2. Fetch User Phone Number**

```javascript
const { data, error } = await supabase
  .from("users")
  .select("full_name, phone_number")
  .eq("phone_number", number)
  .single();
```

### Tables Used

- `users` - User account information
- `group_members` - Group membership data
- `groups` - Group information (via group_id foreign key)

---

## Error Handling

| Scenario                    | Response                                        |
| --------------------------- | ----------------------------------------------- |
| User not in any groups      | `END You are not a member of any groups.`       |
| Phone number not registered | `END Your phone number is not registered.`      |
| Invalid navigation path     | No response generated (handled by default case) |
| Database query error        | Field-specific error handling                   |

---

## Implementation Notes

1. **Text Processing:**
   - Empty text triggers initial menu
   - Chichewa option appends `*2*` to subsequent navigation codes
   - Language switching replaces base text

2. **Phone Number Format:**
   - Stored in database as: `0701234567`
   - Received from carrier as: `+265701234567`
   - Conversion: `phoneNumber.replace("+265", "0")`

3. **Navigation Structure:**
   - Uses numeric selection model
   - Each selection appends to text parameter
   - Path structure: `menu*submenu*option`

4. **Bilingual Support:**
   - English is default
   - Chichewa accessible via option `2`
   - All menus have Chichewa equivalents
