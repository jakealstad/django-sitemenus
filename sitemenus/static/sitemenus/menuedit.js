window.addEvent('domready', function () {

    //parse menu object
    var menu = JSON.decode($('json').get('text'));


    //construct menu from JSON
    var constructMenu = function constructMenu(menuArray) {

        var menuList = new Element('ol');
        var menuPosition = new Element('li', {class: 'position'});
        menuList.grab(menuPosition);

        if(menuArray){
            menuArray.each( function(item){
                var menuItem = new Element('li');
                var menuPosition = new Element('li', {class: 'position'});
                var menuFormTitle = new Element('input', {type: 'text', name: 'title', 'value': item.title});
                var menuFormDescription = new Element('input', {type: 'text', name: 'description', 'value': item.description});
                var menuFormURL = new Element('input', {class: 'url', type: 'text', name: 'url', 'value': item.url});
                                
                menuItem.grab(constructMenu(item.sub_items));
                menuList.adopt(menuItem);
                menuList.adopt(menuPosition);
                menuItem.grab(menuFormURL, 'top');
                menuItem.grab(menuFormDescription, 'top');
                menuItem.grab(menuFormTitle, 'top');
            });
        }        
        return menuList;
    };


    $('menu-edit').grab(constructMenu(menu));


    //create form
    var menulist = $('menu-edit').getFirst('ol');
    var menuForm = new Element('form', {id: 'menuform', method: 'post'}).wraps(menulist);
    
    
    var addToggles = function() {
        $$('#menuform > ol > li:not(.remove-item, .position)').each(function(item) {
            var toggle = new Element('a', {class: 'toggle', html: 'toggle'});
            toggle.inject(item, 'before');
        });
    };

    //add remove button and position item for new menu item
    var removeButtons = function() {
        $$('#menuform ol li:not(.add-item, .remove-item, .position)').each(function(item) {
            if (item.getElement('.remove-item')) {
            } else {
                var menuItemRemove = new Element('span', {class: 'remove-item', html: '-'});
                menuItemRemove.inject(item, 'top'); 
            }
            if (item.getPrevious('.position')) {
            } else {
                var menuPosition = new Element('li', {class: 'position'});
                item.grab(menuPosition, 'before');               
            }
        });
    };

    //menu open/close animation
    var toggleMenu = function() {
        $$('.toggle').each(function(item) {
            var slideToggle = new Fx.Slide(item.getNext().getElement('ol'), {resetHeight: 'true'});
            item.addEvent('click', function(e){
                console.log('clicked');
                e.stop();
                slideToggle.toggle();
            });
        });
    };


    addToggles();
    removeButtons();
    toggleMenu();


    //remove an item
    $('menuform').addEvent('click:relay(span.remove-item)', function(e){
        if (childrenDepth(e.target.getParent()) > 1 && !confirm('There are sub-items, are you sure you want to delete this item?')) {
            return;
        }
        if (itemDepth(e.target) === 0) {
            var clicked = e.target.getParent();
            clicked.getPrevious().getPrevious().dispose();
            clicked.getPrevious().dispose();
            clicked.dispose();
        } else {
            var clicked = e.target.getParent();
            clicked.getPrevious().dispose();
            clicked.dispose();
        }
    });


    //create new item
    var newItem = function(clicked){
        var menuItem = new Element('li');
        var menuFormTitle = new Element('input', {type: 'text', name: 'title'});
        var menuFormDescription = new Element('input', {type: 'text', name: 'description'});
        var menuFormURL = new Element('input', {class: 'url', type: 'text', name: 'url'});
        var menuList = new Element('ol');
        var menuPosition = new Element('li', {class: 'position'});
        var menuPosition2 = new Element('li', {class: 'position'});
        
                
        
        clicked.grab(menuItem, 'after');
        menuItem.grab(menuFormTitle);
        menuItem.grab(menuFormDescription);
        menuItem.grab(menuFormURL);
        menuItem.grab(menuList);
        menuItem.grab(menuPosition, 'after');
        if (itemDepth(clicked) === 0) {
            var toggle = new Element('a', {class: 'toggle', html: 'toggle'});
            toggle.inject(menuItem, 'before');
        }
        menuList.grab(menuPosition2, 'bottom');
        menuItem.getElement('input').focus();
    };


    //calculate depth of menu items children
    var childrenDepth = function childrenDepth(item) {
        var depth = 0;
        if (item.getElement('div')) {
            var children = item.getChildren('div > ol > li:not(.position)');
        } else {
            var children = item.getChildren('ol > li:not(.position)');
        }
        console.log(children);
        if (children) {
            var maxChildDepth = 0;
            children.each(function(child) {
                var childDepth = childrenDepth(child);
                if (childDepth > maxChildDepth) {
                    maxChildDepth = childDepth;
                }
            });
            depth = maxChildDepth + 1;
        }      
        return depth;
    };


    //calculate an items current depth
    var itemDepth = function itemDepth(item) {
        var parentGroup = item.getParents('ol');
        var parents = parentGroup.length - 1;
        //console.log(parents);
        return parents;
    };


    //move items & add a new item (could probably be on its own...)
    var menuGroup1;
    $('menuform').addEvent('click:relay(li)', function(e) {
        if (!menuGroup1) {
            if (e.target.tagName === 'INPUT' || e.target.hasClass('position') || e.target.hasClass('add-item') || e.target.hasClass('remove-item') || e.target.tagName === 'OL') {
                console.log('invalid target');
                if (e.target.hasClass('position')) {
                    var clicked = e.target;
                    newItem(clicked);
                    removeButtons();
                }
            } else {
                e.target.set('class', 'selected');
                if (e.target.getPrevious('.toggle')) {
                    menuGroup1 = [e.target, e.target.getNext(), e.target.getPrevious()];
                } else { 
                    menuGroup1 = [e.target, e.target.getNext()];
                }
            }
        } else {
            var originDepth = childrenDepth(menuGroup1[0]);
            var destination = e.target;
            var destinationDepth = itemDepth(destination);
            console.log('origin depth - ' + originDepth);
            console.log('destination depth - ' + destinationDepth);
            
            if (menuGroup1[0].getElement(destination) || !destination.hasClass('position') || destination === menuGroup1[1] || (originDepth + destinationDepth > 3)) {
                console.log('invalid destination based on that target');
                alert('this is an invalid destination or there are too many sub-items for this destination');
                menuGroup1[1].getPrevious().removeClass('selected');
                menuGroup1 = null;
            } else {
                menuGroup1[1].inject(destination, 'after');
                menuGroup1[0].inject(destination, 'after');
                if (menuGroup1.length >= 3) {
                    menuGroup1[2].inject(destination, 'after');
                }
                menuGroup1[1].getPrevious().removeClass('selected');
                menuGroup1 = null;
            }
        }
        return true;
    });


    //construct JSON object from form data
    var constructObject = function constructObject(menuForm) {
        var menuArray = [];
        var menuItems = menuForm.getChildren('li:not(.position)');
        menuItems.each( function(listItem) {
            var menuItem = {};
            menuItem.title = listItem.getElement('input[name="title"]').get('value');
            menuItem.description = listItem.getElement('input[name="description"]').get('value');
            menuItem.url = listItem.getElement('input[name="url"]').get('value');
            var menuSubItems = listItem.getElement('ol');

            if(menuSubItems){
                menuItem.sub_items = constructObject(menuSubItems);
            }
            menuArray.push(menuItem);
        });
        return menuArray;
    };


    //send json as post data to backend
    $$('input[name="submit"]').addEvent('click', function(e){
        var formMenu = $('menuform').getElement('ol');            
        var menuArray = constructObject(formMenu);
        var menuJSON = JSON.encode(menuArray);
        
        $$('input[name="menudata"]').set('value', menuJSON);
     
        return true;
    });
});
