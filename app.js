/*-----BUDGET CONTROLLER-----*/
var budgetCotroller = (function() {
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
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
        budget: 0
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
        
        calculateBudget: function() {
            calculateTotal('exp');
            calculateTotal('inc');
            
            data.budget = data.totals.inc - data.totals.exp;
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
        expensesContainer: '.expenses__list'
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
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if(type === 'exp') {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);
            
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
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
    }
    
    var updateBudget = function() {
        
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
        }
    };
    
    return {
        init: function() {
            console.log("Application start");
            setUpEventListeners();
        }
    }
})(budgetCotroller, UIController);

controller.init();