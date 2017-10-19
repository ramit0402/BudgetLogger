/*-----BUDGET CONTROLLER-----*/
var budgetCotroller = (function() {
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };
    
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(current) {
            sum += current.value;
        });
        data.totals[type] = sum
    };
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    
    return {
        addItem: function(type, desc, val) {
            var newItem, ID;
            
            //CREATE NEW ID
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
               ID = 0;
            }
            
            //CREATE NEW ITEM BASED ON 'inc' OR'exp TYPE
            if(type === 'exp') {
                newItem = new Expense(ID, desc, val);
            } else if(type === 'inc') {
                newItem = new Income(ID, desc, val);
            }
            
            //PUSH IT INTO OUR DATA-STRUCTURE
            data.allItems[type].push(newItem);
            
            //RETURN NEW ELEMENT
            return newItem;
        },
        
        deleteItem: function(type, id) {
            var ids, index;
            //RETURNS AN ARRAY OF ALL THE ID'S IN THE DATA STRUCTURE
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            
            //GET THE INDEX OF THE ID THAT WE WANT TO DELETE
            index = ids.indexOf(id);
            
            //DELETE THE ITEM FROM THE ARRAY
            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        
        calculateBudget: function() {
            calculateTotal('exp');
            calculateTotal('inc');
            
            data.budget = data.totals.inc - data.totals.exp;
            
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else {
                data.percentage = -1;
            }
        },
        
        calculatePercentages: function() {
            //CALCULATES PERCENTAGE OF EACH EXPENSE
            data.allItems.exp.forEach(function(current) {
                current.calcPercentage(data.totals.inc);
            });
        },
        
        getPercentages: function(){
            var allPercentages;
            
            //STORES ALL THE PERCENTAGE VALUES IN AN ARRAY AND RETURNS IT
            allPercentages = data.allItems.exp.map(function(current) {
                return current.getPercentage();
            });
            return allPercentages;
        },
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        
        testing: function() {
            console.log(data);
        }
        
    };
})();


/*-----UI CONTROLLER-----*/
var UIController = (function() {
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    var formatNumber = function(number, type) {
        var sign;

        number = Math.abs(number);
        number = number.toFixed(2);
        number = parseFloat(number).toLocaleString(undefined, { minimumFractionDigits: 2 });

        return (type === 'exp'? '-' : '+') + number;
    };
    
    var nodeListForEach = function(list, callback) {
        for(var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
            
            
    return {
        //GET ALL THE INPUT STRINGS
        getInput: function() {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },
        
        addListItem: function(obj, type) {
            var html, newHtml, element;
            if(type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if(type === 'exp') {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        deleteListItem: function(selectorID) {
            var el;
            
            //GET THE ELEMENT TO BE DELETED
            el = document.getElementById(selectorID)
            el.parentNode.removeChild(el);
        },
        
        clearFields: function() {
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });
            
            fieldsArr[ 0].focus();
        },
        
        displayBudget: function(obj) {
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, (obj.totalInc >= obj.totalExp? 'inc' : 'exp'));
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp')
            if(obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---'
            }
        },
        
        displayPercentages: function(percentages) {
            var fields;
            //console.log(percentages);
            //SELECTING ALL THE ITEMS IN THE EXPENSE LIST
            fields = document.querySelectorAll(DOMStrings.expensesPercentageLabel);
            
            nodeListForEach(fields, function(current, index) {
                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },
        
        displayMonth: function() {
            var now, year, month;
            
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year; 
        },
        
        changeType: function() {
            var fields;
            
            fields = document.querySelectorAll(DOMStrings.inputType + ',' + DOMStrings.inputDescription + ',' + DOMStrings.inputValue);
            
            nodeListForEach(fields, function(current) {
                current.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMStrings.inputButton).classList.toggle('red');
        },
        
        //AN INTERFACE TO ACCESS DOM STRINGS
        getDOMStrings: function() {
            return DOMStrings;
        }
    }
})();


/*-----APP CONTROLLER-----*/
var controller = (function(budgetCtrl, UICtrl) {
    
    var setUpEventListeners = function() {
        var DOM = UICtrl.getDOMStrings();
        
        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);
    
        document.addEventListener('keypress', function(event) {
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        
        //SETTING EVENT LISTNER ON PARENT TO DELETE ITEM
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        //CHANGE EVENT WHEN EXPENSE IS SELECTED
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    };
    
    var updateBudget = function() {
        //CALCULATES THE BUDGET
        budgetCtrl.calculateBudget();
        
        //GET THE BUDGET
        var budget = budgetCtrl.getBudget();
        
        //DISPLAY BUDGET TO UI
        UICtrl.displayBudget(budget);
    };
    
    var updatePercentages = function() {
        //CALCULATE THE PERCENTAGES
        budgetCtrl.calculatePercentages();
        
        //STORE THE PERCENTAGES IN AN ARRAY
        var percentages = budgetCtrl.getPercentages();
        
        //DISPLAY PERCENTAGES TO UI
        UICtrl.displayPercentages(percentages);
    }
    
    var ctrlAddItem = function() {
        var input, newItem;
        //GET INPUT DATA
        input = UICtrl.getInput();
        
        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //ADD ITEM TO BUDGET
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //ADD ITEM TO THE UI
            UICtrl.addListItem(newItem, input.type);

            //CLEAR FIELDS
            UICtrl.clearFields();

            //CALCULATE AND UPDATE BUDGET
            updateBudget();
            
            //CALCULATE AND UPDATE PERCENTAGES
            updatePercentages();
        }
    };
    
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        
        //GET THE ID OF THE ITEM WHOSE DELETE BUTTON IS CICKED
        itemID = event.path[4].id;
        
        if(itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            //DELETE THE ITEM FROM THE DATA STRUCTURE
            budgetCtrl.deleteItem(type, ID);
            
            //DELETE ITEM FROM THE UI
            UICtrl.deleteListItem(itemID);
            
            //COMPUTE THE BUDGET
            updateBudget();
            
            //CALCULATE AND UPDATE PERCENTAGES
            updatePercentages();
        }
    };
    
    return {
        init: function() {
            console.log("Application start");
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setUpEventListeners();
        }
    }
})(budgetCotroller, UIController);

controller.init();