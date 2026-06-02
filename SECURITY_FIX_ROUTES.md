# 🔧 URGENT: Fix Unprotected Routes

## Quick Summary
**11 out of 12 routes have NO authentication middleware!**

Only `/api/inventory` is protected. All other routes are publicly accessible.

---

## Routes That Need Fixing

### 1. `/api/users/*` - User Management
**File:** `src/routes/userRoutes.js`

**Current (INSECURE):**
```javascript
import express from "express";
import {
  addUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/", addUser);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
```

**Fixed:**
```javascript
import express from "express";
import {
  addUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

const router = express.Router();

router.post("/", protect, authorizeRole("IT", "InventoryAdmin"), addUser);
router.get("/", protect, authorizeRole("IT", "InventoryAdmin"), getUsers);
router.get("/:id", protect, authorizeRole("IT", "InventoryAdmin"), getUserById);
router.put("/:id", protect, authorizeRole("IT", "InventoryAdmin"), updateUser);
router.delete("/:id", protect, authorizeRole("IT", "InventoryAdmin"), deleteUser);

export default router;
```

---

### 2. `/api/asset/*` - Asset Management
**File:** `src/routes/assetRoutes.js`

**Current (INSECURE):**
```javascript
router.post("/assets", createSingleAsset);
router.post("/assets/bulk-create", bulkCreateAssets);
router.get("/assets", fetchAssets);
router.get("/assets/:id", getAssetById);
router.get("/assets/:id/qrcode", getAssetQRCode);
router.put("/assets/:id", updateAsset);
```

**Fixed:**
```javascript
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

// All users can READ
router.get("/assets", protect, authorizeRole("IT", "InventoryStaff", "Accounts", "InventoryAdmin"), fetchAssets);
router.get("/assets/:id", protect, authorizeRole("IT", "InventoryStaff", "Accounts", "InventoryAdmin"), getAssetById);
router.get("/assets/:id/qrcode", protect, authorizeRole("IT", "InventoryStaff", "Accounts", "InventoryAdmin"), getAssetQRCode);

// Only admins can WRITE
router.post("/assets", protect, authorizeRole("IT", "InventoryAdmin"), createSingleAsset);
router.post("/assets/bulk-create", protect, authorizeRole("IT", "InventoryAdmin"), bulkCreateAssets);
router.put("/assets/:id", protect, authorizeRole("IT", "InventoryAdmin"), updateAsset);
```

---

### 3. `/api/checkouts/*` - Checkout Management
**File:** `src/routes/checkoutRoutes.js`

**Current (INSECURE):**
```javascript
router.post("/add", addCheckout);
router.get("/", getCheckouts);
router.get("/:id", getCheckoutById); 
router.delete("/:id", deleteCheckout);
```

**Fixed:**
```javascript
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

router.post("/add", protect, authorizeRole("IT", "InventoryStaff", "Accounts", "InventoryAdmin"), addCheckout);
router.get("/", protect, authorizeRole("IT", "InventoryStaff", "Accounts", "InventoryAdmin"), getCheckouts);
router.get("/:id", protect, authorizeRole("IT", "InventoryStaff", "Accounts", "InventoryAdmin"), getCheckoutById);
router.delete("/:id", protect, authorizeRole("IT", "InventoryAdmin"), deleteCheckout);
```

---

### 4. `/api/property-tagging/*` - Asset Tagging
**File:** `src/routes/propertyTaggingRoutes.js`

**Add protection to all endpoints:**
```javascript
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

// Apply protect middleware to all routes
// Adjust roles based on business logic
```

---

### 5. `/api/reports/*` - Reports
**File:** `src/routes/reportRoutes.js`

**Current (INSECURE):**
```javascript
router.get("/delivery", getDeliveryReport);
router.get("/checkout", getCheckoutReport);
router.get("/returns", getReturnsReport);
router.get("/inventory", getInventoryReport);
router.get("/summary", getSummaryReport);
router.get("/asset", getAssetReports);
```

**Fixed:**
```javascript
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

// Reports accessible by all authenticated users, but only admins can access sensitive data
router.get("/delivery", protect, authorizeRole("IT", "Accounts", "InventoryAdmin"), getDeliveryReport);
router.get("/checkout", protect, authorizeRole("IT", "Accounts", "InventoryAdmin"), getCheckoutReport);
router.get("/returns", protect, authorizeRole("IT", "Accounts", "InventoryAdmin"), getReturnsReport);
router.get("/inventory", protect, authorizeRole("IT", "Accounts", "InventoryAdmin"), getInventoryReport);
router.get("/summary", protect, authorizeRole("IT", "InventoryAdmin"), getSummaryReport);
router.get("/asset", protect, authorizeRole("IT", "InventoryAdmin"), getAssetReports);
```

---

## Other Routes to Fix
- ❌ `/api/categories/*` → Add `protect, authorizeRole(...)`
- ❌ `/api/locations/*` → Add `protect, authorizeRole(...)`
- ❌ `/api/returns/*` → Add `protect, authorizeRole(...)`
- ❌ `/api/delivery/*` → Add `protect, authorizeRole(...)`

---

## Implementation Steps

1. **Update each route file** to import the middleware:
   ```javascript
   import { protect } from "../middleware/authMiddleware.js";
   import { authorizeRole } from "../middleware/authorizeRole.js";
   ```

2. **Add middleware to each route** based on the examples above

3. **Test with Postman/Insomnia**:
   - Without token → Should get 401
   - With expired token → Should get 401
   - With valid token → Should work

4. **Role-based access**: Adjust `authorizeRole(...)` based on who should access each endpoint

---

## Why This Is Critical

- **Token expiration is useless** if routes aren't protected
- **Anyone** can access, modify, or delete your data
- **Compliance risk** - potential data breach
- **Session management** depends on authentication being enforced

**FIX NOW!**
