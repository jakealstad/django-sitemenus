window.addEvent('domready', function() {
    
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
        
        var menuItemAdd = new Element('li', {class: 'add-item', html: '+'});
        menuList.adopt(menuItemAdd);
        
        return menuList;
        
    };
    
    $('menu-edit').grab(constructMenu(menu));

    //create form
    var menulist = $('menu-edit').getFirst('ol');
    var menuForm = new Element('form', {id: 'menuform', method: 'post'}).wraps(menulist);
    
    //create new item
    var newItem = function(clicked){
        var menuItem = new Element('li');
        var menuFormTitle = new Element('input', {type: 'text', name: 'title'});
        var menuFormDescription = new Element('input', {type: 'text', name: 'description'});
        var menuFormURL = new Element('input', {class: 'url', type: 'text', name: 'url'});
        var menuList = new Element('ol');
        var menuItemAdd = new Element('li', {class: 'add-item', html: '+'});
        var menuItemRemove = new Element('li', {class: 'remove-item', html: '-'});
        var menuPosition = new Element('li', {class: 'position'});
        
        clicked.grab(menuItem, 'before');
        menuItem.grab(menuPosition, 'after');
        menuItem.grab(menuFormTitle);
        menuItem.grab(menuFormDescription);
        menuItem.grab(menuFormURL);
        menuItem.grab(menuList);
        menuList.adopt(menuItemAdd);
        //menuList.adopt(menuItemRemove);
        removeButtons();
    };
    
    //add new menu item
    $('menuform').addEvent('click:relay(li.add-item)', function(e){
        var clicked = e.target;
        newItem(clicked);        
    });
    
    //add remove button and position item for new menu item
    var removeButtons = function() {
        $$('#menuform ol li:not(.add-item, .remove-item, .position)').each( function(item) {
            if (item.getElement('.remove-item')) {
            } else {
                var menuItemRemove = new Element('li', {class: 'remove-item', html: '-'});
                menuItemRemove.inject(item, 'top'); 
                if (item.getPrevious('.position')) {
                } else {
                    var menuPosition = new Element('li', {class: 'position'});
                    item.grab(menuPosition, 'before');               
                }
            }
        });
    };
    
    removeButtons();
    
    //remove an item
    $('menuform').addEvent('click:relay(li.remove-item)', function(e){
        var clicked = e.target.getParent();
        if (clicked.getPrevious('.toggle')) {
            clicked.getPrevious().getPrevious().dispose();
            clicked.getPrevious().dispose();
            clicked.dispose();
        } else {
            clicked.getPrevious().dispose();
            clicked.dispose();
        }
    });

    //move an item
    var menuGroup1;
    $('menuform').addEvent('click:relay(li)', function(e) {
        if (!menuGroup1) {
            if (e.target.tagName === 'INPUT' || e.target.hasClass('position') || e.target.hasClass('add-item') || e.target.hasClass('remove-item') || e.target.tagName === 'OL') {
                console.log('invalid target');
            } else {
                e.target.set('class', 'selected');
                if (e.target.getPrevious('.toggle')) {
                    menuGroup1 = [e.target, e.target.getNext(), e.target.getPrevious()];
                } else { 
                    menuGroup1 = [e.target, e.target.getNext()];
                }
                console.log(menuGroup1);
            }
        } else {
            var destination = e.target;
            if (menuGroup1[0].getElement(destination) || !destination.hasClass('position') || destination === menuGroup1[1] || destination.getParent('#menuform > ol > li > div > ol > li > ol')) {
                console.log('invalid destination based on that target');
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
                console.log(menuGroup1);
            }
        }
        
        return true;
    });
    
    //recursively construct JSON object from form
    var constructObject = function constructObject(menuForm) {
        var menuArray = [];
        
        var menuItems = menuForm.getChildren('li:not(.add-item, .remove-item, .position)');
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
    
    //menu open/close animation
    $$('#menuform > ol > li:not(.add-item, .remove-item, .position)').each( function(item) {
        var toggle = new Element('a', {class: 'toggle', html: 'toggle'});
        toggle.inject(item, 'before');
    });
    
    var lists = $$('#menuform > ol > li > ol');
    var button = $$('.toggle');
    var toggles = new Array();

    button.each(function(edit, i) {
        var toggle = new Fx.Slide(lists[i], {resetHeight: 'true'});
        toggles[i] = toggle;

        edit.addEvent('click', function(e){
            e.stop();
            toggle.toggle();
        });
            //toggle.hide();
       
    });
    
    $$('input[name="submit"]').addEvent('click', function(e){
        var formMenu = $('menuform').getElement('ol');            
        var menuArray = constructObject(formMenu);
        var menuJSON = JSON.encode(menuArray);
        
        $$('input[name="menudata"]').set('value', menuJSON);
     
        return true;
    });

});
