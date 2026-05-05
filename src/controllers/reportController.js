import Delivery from "../models/inventory/deliveryModel.js";
import Checkout from "../models/inventory/checkoutModel.js";
import Inventory from "../models/inventory/inventoryModel.js";
import Return from "../models/inventory/returnModel.js";

/* =========================
   🔧 Helpers
========================= */

// 📅 Date filter builder
const buildDateFilter = (from, to, field) => {
  if (!from || !to) return {};
  return {
    [field]: {
      $gte: new Date(from),
      $lte: new Date(new Date(to).setHours(23, 59, 59, 999)),
    },
  };
};

// 📄 Format date
const formatDate = (date) => new Date(date).toLocaleDateString();

// 📦 Pagination
const paginateArray = (array, page = 1, limit = 20, allFlag = false) => {
  const isAll = allFlag || !limit || Number(limit) === 0;

  const total = array.length;

  if (isAll) {
    return {
      items: array,
      total,
      page: 1,
      pages: 1,
    };
  }

  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.max(1, Number(limit) || 20);

  const pages = Math.max(1, Math.ceil(total / safeLimit));
  const start = (safePage - 1) * safeLimit;
  const end = start + safeLimit;

  return {
    items: array.slice(start, end),
    total,
    page: safePage,
    pages,
  };
};

/* =========================
   📦 DELIVERY REPORT
========================= */

export const getDeliveryReport = async (req, res) => {
  try {
    const { from, to, page = 1, limit = 20, all } = req.query;

    const deliveries = await Delivery.find(
      buildDateFilter(from, to, "dateReceived"),
    )
      .sort({ dateReceived: -1 })
      .select("deliveryNumber supplier receivedBy dateReceived items");

    const formatted = deliveries.flatMap((d) =>
      d.items.map((item) => ({
        deliveryNumber: d.deliveryNumber,
        supplier: d.supplier,
        itemName: item.itemName,
        itemType: item.itemType || "-", // ✅ ADDED
        sizeOrSource: item.sizeOrSource || "-",
        gradeLevel: item.gradeLevel || "-",
        barcode: item.barcode?.length ? item.barcode.join(", ") : "-",
        quantity: item.quantity,
        date: formatDate(d.dateReceived),
        receivedBy: d.receivedBy,
      })),
    );

    res.status(200).json(paginateArray(formatted, page, limit, all === "true"));
  } catch (error) {
    console.error("❌ Delivery report error:", error);
    res
      .status(500)
      .json({ message: "Server error generating delivery report." });
  }
};

/* =========================
   🔁 RETURNS REPORT
========================= */

export const getReturnsReport = async (req, res) => {
  try {
    const { from, to, page = 1, limit = 20, all } = req.query;

    const records = await Return.find(buildDateFilter(from, to, "dateReturned"))
      .sort({ dateReturned: -1 })
      .select(
        "returnNumber receiptRef transactionRef returnedBy dateReturned items",
      );

    const formatted = records.flatMap((r) =>
      r.items.map((item) => ({
        returnNumber: r.returnNumber,
        receiptRef: r.receiptRef,
        transactionRef: r.transactionRef || "-",
        itemId: item.itemId,
        itemName: item.itemName,
        itemType: item.itemType || "-", // ✅ ADDED
        sizeOrSource: item.sizeOrSource || "-",
        gradeLevel: item.gradeLevel || "-",
        quantity: item.quantity,
        condition: item.condition || "Good",
        remarks: item.remarks || "",
        date: formatDate(r.dateReturned),
        returnedBy: r.returnedBy,
      })),
    );

    res.status(200).json(paginateArray(formatted, page, limit, all === "true"));
  } catch (error) {
    console.error("❌ Returns report error:", error);
    res
      .status(500)
      .json({ message: "Server error generating returns report." });
  }
};

/* =========================
   📤 CHECKOUT REPORT
========================= */

export const getCheckoutReport = async (req, res) => {
  try {
    const { from, to, page = 1, limit = 20, all } = req.query;

    const checkouts = await Checkout.find(
      buildDateFilter(from, to, "createdAt"),
    )
      .sort({ createdAt: -1 })
      .select("transactionNo receiptNo issuedBy createdAt items");

    const formatted = checkouts.flatMap((c) =>
      c.items.map((item) => ({
        transactionNo: c.transactionNo,
        date: formatDate(c.createdAt),
        receiptNo: c.receiptNo,
        itemType: item.itemType || "-",
        itemName: item.itemName || "-",
        gradeLevel: item.gradeLevel || "-",
        sizeOrSource: item.sizeOrSource || "-",
        barcode: item.barcode || "-",
        quantity: item.quantity || 0,
        receivedBy: c.issuedBy || "-",
      })),
    );

    res.status(200).json(paginateArray(formatted, page, limit, all === "true"));
  } catch (error) {
    console.error("❌ Checkout report error:", error);
    res
      .status(500)
      .json({ message: "Server error generating checkout report." });
  }
};

/* =========================
   📊 INVENTORY REPORT
========================= */

export const getInventoryReport = async (req, res) => {
  try {
    const { page = 1, limit = 20, all } = req.query;

    const items = await Inventory.find()
      .sort({ itemName: 1 })
      .select("-_id -__v");

    res.status(200).json(paginateArray(items, page, limit, all === "true"));
  } catch (error) {
    console.error("❌ Inventory report error:", error);
    res
      .status(500)
      .json({ message: "Server error generating inventory report." });
  }
};

/* =========================
   🧮 SUMMARY REPORT
========================= */

export const getSummaryReport = async (req, res) => {
  try {
    const { from, to, page = 1, limit = 20, all } = req.query;

    const fromDate = from ? new Date(from) : null;
    const toDate = new Date(to || new Date());
    toDate.setHours(23, 59, 59, 999);

    const matchDate = (field) =>
      fromDate
        ? { [field]: { $gte: fromDate, $lte: toDate } }
        : { [field]: { $lte: toDate } };

    // Aggregations
    const [deliveryAgg, checkoutAgg, returnsAgg] = await Promise.all([
      Delivery.aggregate([
        { $match: matchDate("dateReceived") },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.itemId",
            totalDelivered: { $sum: "$items.quantity" },
          },
        },
      ]),
      Checkout.aggregate([
        { $match: matchDate("createdAt") },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.itemId",
            totalCheckedOut: { $sum: "$items.quantity" },
          },
        },
      ]),
      Return.aggregate([
        { $match: matchDate("dateReturned") },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.itemId",
            totalReturned: { $sum: "$items.quantity" },
          },
        },
      ]),
    ]);

    // Convert to maps (⚡ faster lookup)
    const deliveryMap = Object.fromEntries(
      deliveryAgg.map((d) => [d._id, d.totalDelivered]),
    );
    const checkoutMap = Object.fromEntries(
      checkoutAgg.map((c) => [c._id, c.totalCheckedOut]),
    );
    const returnMap = Object.fromEntries(
      returnsAgg.map((r) => [r._id, r.totalReturned]),
    );

    const inventory = await Inventory.find().select(
      "itemId itemName itemType sizeOrSource gradeLevel quantity",
    );

    const summary = inventory.map((inv) => {
      const totalDelivered = deliveryMap[inv.itemId] || 0;
      const totalCheckedOut = checkoutMap[inv.itemId] || 0;
      const totalReturned = returnMap[inv.itemId] || 0;

      const netChange = totalDelivered + totalReturned - totalCheckedOut;

      return {
        itemId: inv.itemId,
        itemName: inv.itemName,
        itemType: inv.itemType || "-", // ✅ ADDED
        sizeOrSource: inv.sizeOrSource || "-",
        gradeLevel: inv.gradeLevel || "-",
        totalDelivered,
        totalReturned,
        totalCheckedOut,
        netChange,
        totalStockAsOfDate: netChange,
        currentStock: inv.quantity,
      };
    });

    const totals = summary.reduce(
      (acc, cur) => {
        acc.totalDelivered += cur.totalDelivered;
        acc.totalReturned += cur.totalReturned;
        acc.totalCheckedOut += cur.totalCheckedOut;
        acc.totalStockAsOfDate += cur.totalStockAsOfDate;
        return acc;
      },
      {
        totalDelivered: 0,
        totalReturned: 0,
        totalCheckedOut: 0,
        totalStockAsOfDate: 0,
      },
    );

    const paged = paginateArray(summary, page, limit, all === "true");

    res.status(200).json({
      dateRange: {
        from: fromDate ? fromDate.toISOString() : "Beginning",
        to: toDate.toISOString(),
      },
      summary: paged.items,
      totals,
      total: paged.total,
      page: paged.page,
      pages: paged.pages,
    });
  } catch (error) {
    console.error("❌ Summary report error:", error);
    res
      .status(500)
      .json({ message: "Server error generating summary report." });
  }
};
