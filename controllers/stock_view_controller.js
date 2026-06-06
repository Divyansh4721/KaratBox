const Approval = require('../models/approval');
const Bill = require('../models/bill');
const Index = require('../models/index');
const Ornament = require('../models/list_ornament');
const Prefix = require('../models/list_prefix');
const DailyUpdateList = require('../models/DailyUpdateList');
const Stock = require('../models/stock');
const StockType = require('../models/list_stocktype');
const common_function = require('../controllers/common_function');
module.exports.categoryPage = async function (req, res) {
    try {
        let ornamentTable = await Ornament.find()
            .sort({
                name: 1
            });
        let prefixTable = await Prefix.find()
            .sort({
                name: 1
            });
        let stockTypeTable = await StockType.find()
            .sort({
                name: 1
            });
        return res.render('category', {
            title: await common_function.AppName() + " | Category",
            prefixTable,
            ornamentTable,
            stockTypeTable,
        });
    } catch (err) {
        console.log('Error in Category List Page!', err);
        req.flash('error', 'Error in Category List Page!');
        return res.redirect(req.get('Referrer') || '/');
    }
}
module.exports.categoryForm = async function (req, res) {
    try {
        if (req.query.item) {
            let stock = await Stock.findOne({
                index: req.query.item,
            });
            if (stock) {
                return res.redirect("/stock/" + stock.id);
            } else {
                req.flash('error', 'Tag Number Not Found!');
                return res.redirect("back")
            }
        } else if (req.query.tag) {
            let stock = await Stock.findOne({
                prefix: req.query.prefix,
                ornament: req.query.ornament,
                tag: req.query.tag,
            });
            if (stock) {
                return res.redirect("/stock/" + stock.id);
            } else {
                req.flash('error', 'Tag Number Not Found!');
                return res.redirect("back")
            }
        } else if (req.query.stockType) {
            let stockTable = await Stock.find({
                stockType: req.query.stockType
            })
                .populate("prefix ornament purity stockType stoneTable.type");
            for (let i = 0; i < stockTable.length; i++) {
                await common_function.calculatePrice(stockTable[i]);
            }
            return res.render('categoryView', {
                title: await common_function.AppName() + " | Stock List",
                stockTable,
            });
        } else if (!req.query.ornament) {
            let stockTable = await Stock.find({
                prefix: req.query.prefix
            })
                .populate("prefix ornament purity stockType stoneTable.type");
            for (let i = 0; i < stockTable.length; i++) {
                await common_function.calculatePrice(stockTable[i]);
            }
            return res.render('categoryView', {
                title: await common_function.AppName() + " | Stock List",
                stockTable,
            });
        } else {
            let stockTable = await Stock.find({
                prefix: req.query.prefix,
                ornament: req.query.ornament,
            })
                .populate("prefix ornament purity stockType stoneTable.type");
            for (let i = 0; i < stockTable.length; i++) {
                await common_function.calculatePrice(stockTable[i]);
            }
            return res.render('categoryView', {
                title: await common_function.AppName() + " | Stock List",
                stockTable,
            });
        }
    } catch (err) {
        console.log('Error in Stock List Page!', err);
        req.flash('error', 'Error in Stock List Page!');
        return res.redirect(req.get('Referrer') || '/');
    }
}
module.exports.dataPage = async function (req, res) {
    try {
        return res.render('dataPage', {
            title: await common_function.AppName() + " | Data",
        });
    } catch (err) {
        console.log('Error in Category List Page!', err);
        req.flash('error', 'Error in Category List Page!');
        return res.redirect(req.get('Referrer') || '/');
    }
}
module.exports.createLists = async function () {
    try {
        let date = new Date();
        let startOfDay = new Date(date.setHours(0, 0, 0, 0));
        let endOfDay = new Date(date.setHours(23, 59, 59, 999));
        // arrivalTable
        let temp = await Stock.find({
            createdDate: {
                $gte: startOfDay,
                $lte: endOfDay,
            }
        })
            .select('_id');
        let arrivalTable = temp.map(item => item._id.toString());
        // editTable
        temp = await Stock.find({
            updatedTable: {
                $elemMatch: {
                    date: {
                        $gte: startOfDay,
                        $lte: endOfDay,
                    }
                }
            }
        })
            .select('_id');
        let editTable = temp.map(item => item._id.toString());
        // soldTable
        temp = await Bill.find({
            createdAt: {
                $gte: startOfDay,
                $lte: endOfDay,
            },
            customer: {
                $exists: true,
            }
        });
        let soldTable = [];
        for (let i of temp)
            soldTable = soldTable.concat(i.cart.map(item => item._id.toString()));
        // deletedTable
        temp = await Bill.find({
            createdAt: {
                $gte: startOfDay,
                $lte: endOfDay,
            },
            customer: {
                $exists: false,
            }
        });
        let deletedTable = [];
        for (let i of temp)
            deletedTable = deletedTable.concat(i.cart.map(item => item._id.toString()));
        // totalApprovalTable
        temp = await Approval.find({
            receivedDate: {
                $exists: false,
            }
        }).select('cart');
        let totalApprovalTable = [];
        for (let i of temp)
            totalApprovalTable = totalApprovalTable.concat(i.cart.map(item => item._id.toString()));
        totalApprovalTable = [...new Set(totalApprovalTable)];
        // approvalGiveTable
        temp = await Approval.find({
            approvedDate: {
                $gte: startOfDay,
                $lte: endOfDay,
            },
            receivedDate: {
                $exists: false,
            }
        }).select('cart');
        let approvalGiveTable = [];
        for (let i of temp)
            approvalGiveTable = approvalGiveTable.concat(i.cart.map(item => item._id.toString()));
        approvalGiveTable = [...new Set(approvalGiveTable)];
        // approvalTakeTable
        temp = await Approval.find({
            approvedDate: {
                $lte: startOfDay,
            },
            receivedDate: {
                $gte: startOfDay,
                $lte: endOfDay,
            }
        }).select('cart');
        let approvalTakeTable = [];
        for (let i of temp)
            approvalTakeTable = approvalTakeTable.concat(i.cart.map(item => item._id.toString()));
        approvalTakeTable = [...new Set(approvalTakeTable)];
        // closingTable
        temp = await Stock.find({
            isInStock: true
        })
            .select('_id');
        let closingTable = temp.map(item => item._id.toString());
        return [arrivalTable, editTable, soldTable, deletedTable, totalApprovalTable, approvalGiveTable, approvalTakeTable, closingTable];
    } catch (err) {
        console.log('Error in Creating Lists!', err);
    }
}
async function createFullList(arrivalTable, editTable, soldTable, deletedTable, totalApprovalTable, approvalGiveTable, approvalTakeTable, closingTable) {
    try {
        let populateStockTable = async (stockTable) => {
            return await Stock.find({
                _id: {
                    $in: stockTable
                }
            })
                .populate('prefix ornament purity kaarigar stockType approveTable stoneTable.type stoneTable.dealerName')
                .populate('createdBy', 'email name')
                .populate('deletedBy', 'email name')
                .populate('updatedTable.user', 'email name')
                .populate({
                    path: 'bill',
                    populate: [{
                        path: 'customer',
                        select: 'name'
                    },
                    {
                        path: 'user',
                        select: 'email name'
                    },
                    ]
                })
                .sort({
                    'prefix': 1,
                    'ornament': 1,
                    'tag': 1,
                });
        }
        let convertStockToList = async (stockTable) => {
            let nameTable = await Index.find({
                name: {
                    $exists: false
                }
            })
                .populate('prefix ornament');
            nameTable = nameTable.filter(doc => doc.prefix !== null && doc.ornament !== null);
            nameTable.sort((a, b) => a.prefix.name.localeCompare(b.prefix.name) || a.ornament.name.localeCompare(b.ornament.name));
            let list = nameTable.map(i => ({
                total: 0,
                name: `${i.prefix.name} ${i.ornament.name}`,
                stoneWt: 0,
                grossWt: 0,
            }));
            stockTable.forEach(i => {
                let temp = list.find(item => item.name === `${i.prefix.name} ${i.ornament.name}`);
                if (temp) {
                    temp.total++;
                    temp.stoneWt += i.stoneWt;
                    temp.grossWt += i.grossWt;
                }
            });
            return list.filter(item => item.total > 0);
        }
        // totalTable
        let totalTable = JSON.parse(JSON.stringify(closingTable));
        totalTable = totalTable.concat(totalApprovalTable);
        // openingTable
        let openingTable = JSON.parse(JSON.stringify(totalTable));
        openingTable = openingTable.concat(soldTable);
        openingTable = openingTable.concat(deletedTable);
        openingTable = openingTable.filter(item => !arrivalTable.includes(item));
        // Now starts
        openingTable = await populateStockTable(openingTable);
        let openingList = await convertStockToList(openingTable);
        arrivalTable = await populateStockTable(arrivalTable);
        let arrivalList = await convertStockToList(arrivalTable);
        editTable = await populateStockTable(editTable);
        // let editList = await convertStockToList(editTable);
        soldTable = await populateStockTable(soldTable);
        let soldList = await convertStockToList(soldTable);
        deletedTable = await populateStockTable(deletedTable);
        let deletedList = await convertStockToList(deletedTable);
        totalApprovalTable = await populateStockTable(totalApprovalTable);
        let totalApprovalList = await convertStockToList(totalApprovalTable);
        approvalGiveTable = await populateStockTable(approvalGiveTable);
        // let approvalGiveList = await convertStockToList(approvalGiveTable);
        approvalTakeTable = await populateStockTable(approvalTakeTable);
        // let approvalTakeList = await convertStockToList(approvalTakeTable);
        closingTable = await populateStockTable(closingTable);
        let closingList = await convertStockToList(closingTable);
        totalTable = await populateStockTable(totalTable);
        let totalList = await convertStockToList(totalTable);
        let nameTable = await Index.find({
            name: {
                $exists: false
            }
        })
            .populate('prefix ornament');
        nameTable = nameTable.filter(doc => doc.prefix !== null && doc.ornament !== null);
        nameTable.sort((a, b) => a.prefix.name.localeCompare(b.prefix.name) || a.ornament.name.localeCompare(b.ornament.name));
        let fullList = nameTable.map(i => ({
            name: `${i.prefix.name} ${i.ornament.name}`,
            count: 0
        }));
        let updateList = (list, propName) => {
            for (let item of list) {
                let temp = fullList.find(x => x.name === item.name);
                temp.count++;
                temp[propName] = item;
            }
        }
        updateList(openingList, 'opening');
        updateList(arrivalList, 'arrival');
        updateList(soldList, 'sold');
        updateList(deletedList, 'delete');
        updateList(totalApprovalList, 'approval');
        updateList(closingList, 'closing');
        updateList(totalList, 'total');
        fullList = fullList.filter(item => item.count !== 0);
        // Sum Total of columns
        temp = `{"name": "Total",
                "opening": {"total": 0, "stoneWt": 0, "grossWt": 0},
                "arrival": {"total": 0, "stoneWt": 0, "grossWt": 0},
                "sold": {"total": 0, "stoneWt": 0, "grossWt": 0},
                "delete": {"total": 0, "stoneWt": 0, "grossWt": 0},
                "approval": {"total": 0, "stoneWt": 0, "grossWt": 0},
                "closing": {"total": 0, "stoneWt": 0, "grossWt": 0},
                "total": {"total": 0, "stoneWt": 0, "grossWt": 0}}`;
        temp = JSON.parse(temp);
        let categories = ['opening', 'arrival', 'sold', 'delete', 'approval', 'closing', 'total'];
        for (let i of fullList) {
            for (let category of categories) {
                if (i[category]) {
                    temp[category].total += i[category].total || 0;
                    temp[category].stoneWt += i[category].stoneWt || 0;
                    temp[category].grossWt += i[category].grossWt || 0;
                }
            }
        }
        fullList.push(temp);
        shortFullList = fullList.filter(item => (!item.arrival && !item.sold && !item.delete && !item.approval) ? false : true);
        return [fullList, shortFullList, arrivalTable, editTable, soldTable, deletedTable, approvalGiveTable, approvalTakeTable];
    } catch (err) {
        console.log('Error in Creating Full List!', err);
    }
}
module.exports.dailySheetPage = async function (req, res) {
    try {
        let lists = await module.exports.createLists();
        let tables = await createFullList(lists[0], lists[1], lists[2], lists[3], lists[4], lists[5], lists[6], lists[7]);
        return res.render('stockChangeList', {
            title: await common_function.AppName() + " | Updates List",
            date: new Date().toDateString(),
            fullList: tables[0],
            shortFullList: tables[1],
            arrivalTable: tables[2],
            editTable: tables[3],
            soldTable: tables[4],
            deletedTable: tables[5],
            approvalGiveTable: tables[6],
            approvalTakeTable: tables[7],
        });
    } catch (err) {
        console.log('Error in Daily Sheet Page!', err);
        req.flash('error', 'Error in Daily Sheet Page!');
        return res.redirect(req.get('Referrer') || '/');
    }
}
module.exports.customSheetPage = async function (req, res) {
    try {
        let date = new Date(req.body.date);
        let startOfDay = new Date(date.setHours(0, 0, 0, 0));
        let endOfDay = new Date(date.setHours(23, 59, 59, 999));
        let lists = [];
        let tables = [];
        if (date.toDateString() === new Date().toDateString()) {
            lists = await module.exports.createLists();
            tables = await createFullList(
                lists[0],
                lists[1],
                lists[2],
                lists[3],
                lists[4],
                lists[5],
                lists[6],
                lists[7]
            );
        } else {
            lists = await DailyUpdateList.findOne({
                createdAt: {
                    $gte: startOfDay,
                    $lte: endOfDay,
                }
            });
            if (!lists) {
                req.flash('error', 'Custom Lists not Available!');
                return res.redirect(req.get('Referrer') || '/');
            }
            tables = await createFullList(
                lists.arrival,
                lists.edit,
                lists.sold,
                lists.deleted,
                lists.totalApproval,
                lists.approvalGive,
                lists.approvalTake,
                lists.closing,
            );
        }
        tables[0] = tables[0].filter(item => item.name !== "Total");
        let checkList = [];
        for (let item of tables[0]) {
            checkList.push(item.name);
        }
        return res.render('stockChangeListCustom', {
            title: await common_function.AppName() + " | Updates List",
            date: new Date(req.body.date).toDateString(),
            fullList: tables[0],
            checkList,
        });
    } catch (err) {
        console.log('Error in Back Date Page!', err);
        req.flash('error', 'Error in Back Date Page!');
        return res.redirect(req.get('Referrer') || '/');
    }
}
module.exports.backDateSheetPage = async function (req, res) {
    try {
        let date = new Date(req.body.date);
        let startOfDay = new Date(date.setHours(0, 0, 0, 0));
        let endOfDay = new Date(date.setHours(23, 59, 59, 999));
        let lists = await DailyUpdateList.findOne({
            createdAt: {
                $gte: startOfDay,
                $lte: endOfDay,
            }
        });
        if (!lists) {
            req.flash('error', 'Daily Lists not Available!');
            return res.redirect(req.get('Referrer') || '/');
        }
        let tables = await createFullList(
            lists.arrival,
            lists.edit,
            lists.sold,
            lists.deleted,
            lists.totalApproval,
            lists.approvalGive,
            lists.approvalTake,
            lists.closing,
        );
        return res.render('stockChangeList', {
            title: await common_function.AppName() + " | Updates List",
            date: new Date(req.body.date).toDateString(),
            fullList: tables[0],
            shortFullList: tables[1],
            arrivalTable: tables[2],
            editTable: tables[3],
            soldTable: tables[4],
            deletedTable: tables[5],
            approvalGiveTable: tables[6],
            approvalTakeTable: tables[7],
        });
    } catch (err) {
        console.log('Error in Back Date Page!', err);
        req.flash('error', 'Error in Back Date Page!');
        return res.redirect(req.get('Referrer') || '/');
    }
}
module.exports.allStockPage = async function (req, res) {
    try {
        let stockTable = await Stock.find()
            .populate('prefix ornament purity kaarigar stockType approveTable stoneTable.type stoneTable.dealerName')
            .populate('createdBy', 'email name')
            .populate('deletedBy', 'email name')
            .populate('updatedTable.user', 'email name')
            .populate({
                path: 'bill',
                populate: [{
                    path: 'customer',
                    select: 'name'
                },
                {
                    path: 'user',
                    select: 'email name'
                },
                ]
            })
            .sort({
                'prefix': 1,
                'ornament': 1,
                'tag': 1,
            });
        for (let i = 0; i < stockTable.length; i++) {
            await common_function.calculatePrice(stockTable[i]);
        }
        return res.render('stockTable', {
            title: await common_function.AppName() + " | All Stock",
            stockTable,
        });
    } catch (err) {
        console.log('Error in All Stock Page!', err);
        req.flash('error', 'Error in All Stock Page!');
        return res.redirect(req.get('Referrer') || '/');
    }
}
module.exports.allInStockPage = async function (req, res) {
    try {
        let stockTable = await Stock.find({
            isInStock: true,
        })
            .populate('prefix ornament purity kaarigar stockType approveTable stoneTable.type stoneTable.dealerName')
            .populate('createdBy', 'email name')
            .populate('deletedBy', 'email name')
            .populate('updatedTable.user', 'email name')
            .populate({
                path: 'bill',
                populate: [{
                    path: 'customer',
                    select: 'name'
                },
                {
                    path: 'user',
                    select: 'email name'
                },
                ]
            })
            .sort({
                'prefix': 1,
                'ornament': 1,
                'tag': 1,
            });
        for (let i = 0; i < stockTable.length; i++) {
            await common_function.calculatePrice(stockTable[i]);
        }
        return res.render('stockTable', {
            title: await common_function.AppName() + " | All In Stock",
            stockTable,
        });
    } catch (err) {
        console.log('Error in All InStock Page!', err);
        req.flash('error', 'Error in All InStock Page!');
        return res.redirect(req.get('Referrer') || '/');
    }
}
module.exports.allOutStockPage = async function (req, res) {
    try {
        let stockTable = await Stock.find({
            isInStock: false,
        })
            .populate('prefix ornament purity kaarigar stockType approveTable stoneTable.type stoneTable.dealerName')
            .populate('createdBy', 'email name')
            .populate('deletedBy', 'email name')
            .populate('updatedTable.user', 'email name')
            .populate({
                path: 'bill',
                populate: [{
                    path: 'customer',
                    select: 'name'
                },
                {
                    path: 'user',
                    select: 'email name'
                },
                ]
            })
            .sort({
                'prefix': 1,
                'ornament': 1,
                'tag': 1,
            });
        for (let i = 0; i < stockTable.length; i++) {
            await common_function.calculatePrice(stockTable[i]);
        }
        return res.render('stockTable', {
            title: await common_function.AppName() + " | All Out Stock",
            stockTable,
        });
    } catch (err) {
        console.log('Error in All Out Stock Page!', err);
        req.flash('error', 'Error in All Out Stock Page!');
        return res.redirect(req.get('Referrer') || '/');
    }
}