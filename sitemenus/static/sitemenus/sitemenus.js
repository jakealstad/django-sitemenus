window.addEvent('domready', function () {

    //parse menu object
    var menu = JSON.decode($('json').get('text'));

    //construct menu from JSON
    var constructMenu = function constructMenu(menuArray) {
        var menuList = new Element('ol');
        menuList.grab(new Element('li', {class: 'position'}));

        if(menuArray){
            menuArray.each( function(item){
                var menuItem = new Element('li');
                menuItem.grab(constructMenu(item.sub_items));
                menuList.adopt(menuItem);
                menuList.adopt(new Element('li', {class: 'position'}));
                menuItem.grab(new Element('input', {
                    class: 'url',
                    type: 'text',
                    name: 'url',
                    value: item.url
                }), 'top');
                menuItem.grab(new Element('input', {
                    type: 'text',
                    name: 'description',
                    value: item.description
                }), 'top');
                menuItem.grab(new Element('input', {
                    type: 'text',
                    name: 'title',
                    value: item.title
                }), 'top');
            });
        }        
        return menuList;
    };

    document.id('menu-edit').grab(constructMenu(menu));

    //create form
    var menuForm = new Element('form', {
        id: 'menuform',
        method: 'post'
    }).wraps(document.id('menu-edit').getFirst('ol'));
    
    //add toggle nodes    
    var addToggles = function() {
        $$('#menuform > ol > li:not(.remove-item, .position)').each(function(item) {
            var toggle = new Element('a', {
                class: 'toggle',
                html: 'toggle'
            });
            toggle.inject(item, 'before');
        });
    };

    //add remove button and position item for new menu item
    var addRemoveButtons = function() {
        $$('#menuform ol li:not(.add-item, .remove-item, .position)').each(function(item) {
            if (!item.getElement('.remove-item')) {
                new Element('span', {
                    class: 'remove-item',
                    html: '-'
                }).inject(item, 'top'); 
            }
            if (!item.getPrevious('.position')) {
                item.grab(new Element('li', {class: 'position'}), 'before');               
            }
        });
    };

    //menu open/close animation
    var toggleMenu = function() {
        $$('.toggle').each(function(item) {
            var slideToggle = new Fx.Slide(item.getNext().getElement('ol'), {resetHeight: 'true'});
            item.addEvent('click', function(e){
                e.stop();
                slideToggle.toggle();
            });
        });
    };

    addToggles();
    addRemoveButtons();
    toggleMenu();

    //remove an item
    document.id('menuform').addEvent('click:relay(span.remove-item)', function(e){
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
        var menuList = new Element('ol');
        clicked.grab(menuItem, 'after');
        menuItem.grab(new Element('input', {
            type: 'text',
            name: 'title'
        }));
        menuItem.grab(new Element('input', {
            type: 'text',
            name: 'description'
        }));
        menuItem.grab(new Element('input', {
            class: 'url',
            type: 'text',
            name: 'url'
        }));
        menuItem.grab(menuList);
        menuItem.grab(new Element('li', {class: 'position'}), 'after');
        if (itemDepth(clicked) === 0) {
            var toggle = new Element('a', {class: 'toggle', html: 'toggle'});
            toggle.inject(menuItem, 'before');
            var slideToggle = new Fx.Slide(toggle.getNext().getElement('ol'), {resetHeight: 'true'});
            toggle.addEvent('click', function(e){
                e.stop();
                slideToggle.toggle();
            });
        }
        menuList.grab(new Element('li', {class: 'position'}), 'bottom');
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
        var parents = item.getParents('ol').length - 1;
        return parents;
    };

    //move items & add a new item (could probably be on its own...)
    var menuGroup;
    document.id('menuform').addEvent('click:relay(li)', function(e) {
        if (!menuGroup) {
            if (e.target.tagName === 'INPUT' || e.target.hasClass('position') ||
                    e.target.hasClass('add-item') || e.target.hasClass('remove-item') ||
                    e.target.tagName === 'OL') {
                if (e.target.hasClass('position')) {
                    var clicked = e.target;
                    newItem(clicked);
                    addRemoveButtons();
                }
            } else {
                menuGroup = e.target;
                menuGroup.set('class', 'selected');
            }
        } else {
            var originDepth = childrenDepth(menuGroup);
            var destination = e.target;
            var destinationDepth = itemDepth(destination);
            
            if (menuGroup.getElement(destination) ||
                    !destination.hasClass('position') ||
                    destination === menuGroup.getNext() ||
                    (originDepth + destinationDepth > 3)) {
                //remove when integrating
                alert('this is an invalid destination or there are too many sub-items for this destination');
                menuGroup.removeClass('selected');
                menuGroup = null;
            } else if (menuGroup.getPrevious('.toggle')) {
                menuGroup.getNext().inject(destination, 'after');
                var moveToggle = menuGroup.getPrevious();
                menuGroup.inject(destination, 'after');
                moveToggle.inject(menuGroup, 'before');
                menuGroup.removeClass('selected');
                menuGroup = null;
            } else if (!menuGroup.getPrevious('.toggle') && destinationDepth <= 2) {
                menuGroup.getNext().inject(destination, 'after');
                menuGroup.inject(destination, 'after');
                var toggle = new Element('a', {class: 'toggle', html: 'toggle'}).inject(menuGroup, 'before');
                var slideToggle = new Fx.Slide(toggle.getNext().getElement('ol'), {resetHeight: 'true'});
                    toggle.addEvent('click', function(e){
                        e.stop();
                        slideToggle.toggle();
                });
                menuGroup.removeClass('selected');
                menuGroup = null;
            } else {
                menuGroup.getNext().inject(destination, 'after');
                menuGroup.inject(destination, 'after');
                menuGroup.removeClass('selected');
                menuGroup = null;
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
    document.getElement('input[name="submit"]').addEvent('click', function(e){
        var formMenu = document.id('menuform').getElement('ol');            
        var menuArray = constructObject(formMenu);
        var menuJSON = JSON.encode(menuArray);
        document.getElement('input[name="menudata"]').set('value', menuJSON);
        return true;
    });
});
