/**
 * Created by Troy on 2016/9/5.
 */
'use strict';
//A button
var confirmBtn = enchant.Class.create(enchant.Sprite,{
    initialize:function() {
        enchant.Sprite.call(this,20,20);
        this.x = 560;
        this.y = 370;
        this.image = g.assets[g.resource['aBtn']];
        this.timer = this.age + 15;
        return this;
    },
    onenterframe:function() {
        if(this.age >= this.timer) {
            this.opacity = this.opacity ? 0 : 1;
            this.timer = this.age + 15;
        }
    }
});

//对话黑色背景
var backSprite = enchant.Class.create(enchant.Sprite,{
    initialize:function(width,height,x,y,bgColor,opacity) {
        enchant.Sprite.call(this,width,height);
        this.x = x;
        this.y = y;
        this.backgroundColor = bgColor || 'black';
        this.opacity = opacity || 0.8;

        return this;
    }
});

//展示商品时的上下箭头
var triangle = enchant.Class.create(enchant.Sprite,{
    initialize:function(x,y,image,width,height,scaleX,scaleY) {
        enchant.Sprite.call(this,width || 8,height || 4);
        this.x = x;
        this.y = y;
        this.scale(scaleX || 1,scaleY || 1);
        this.image = g.assets[g.resource[image]];

        return this;
    }
});

//创建对话选项
var choiceText = enchant.Class.create(enchant.Group,{
    initialize:function(choice,x,y) {
        enchant.Group.call(this);

        var that = this;

        choice.forEach(function(o) {
            var label = new Label(o.text);
            label.x = x;
            label.y = y;
            label.color = '#fff';
            label.font = '18px Microsoft YaHei';
            x += 80;

            that.addChild(label);
        });

        this.cursor = new cursor(10,353);
        this.addChild(this.cursor);

        return this;
    }
});

var choiceText2 = enchant.Class.create(enchant.Group,{
    initialize:function(choice,x,y) {
        enchant.Group.call(this);

        var that = this;
        var sprite = new backSprite(100,110,0,0);
        this.addChild(sprite);
        choice.forEach(function(o) {
            var label = new Label(o.text);
            label.x = x;
            label.y = y;
            label.color = '#fff';
            label.font = '18px Microsoft YaHei';
            y += 30;

            that.addChild(label);
        });

        this.cursor = new cursor(10,15,'vertical');
        this.addChild(this.cursor);


        return this;
    }
});

var choiceText3 = enchant.Class.create(enchant.Group,{
    initialize:function(choice,x,y,number) {
        enchant.Group.call(this);

        var that = this;
        var sprite = new backSprite(130,110,0,130);
        this.addChild(sprite);
        choice.forEach(function(o) {
            var label = new Label(o);
            label.x = x;
            label.y = y;
            label.color = '#fff';
            label.font = '18px Microsoft YaHei';
            y += 30;

            that.addChild(label);
        });

        this.cursor = new cursor(10,140,'vertical',number);
        this.addChild(this.cursor);


        return this;
    }
});

/**
 * 创建手形指针
 * @param x {number} x坐标
 * @param y {number} y坐标
 * @param isVertical {Boolean|String} 是否竖形菜单
 * @param number {number} 菜单有几个选项
 * @param step {number} 每个选项之间的间隔，仅用于竖形菜单
 * @type {enchant.Sprite}
 */
var cursor = enchant.Class.create(enchant.Sprite,{
    initialize:function(x,y,isVertical,number,step) {
        enchant.Sprite.call(this,20,20);
        this.old_x = x;
        this.old_y = y;
        this.x = x;
        this.y = y;
        this.isVertical = isVertical;
        this.number = (number - 1 === 0) ? 0 : (number - 1) || 2;
        this.step = step || 30;
        this.keyCount = 0;
        this.selected = 0;
        this.image = g.assets[g.resource['cursor']];

        return this;
    },
    onenterframe:function() {
        if(!this.isVertical) {//横向选择
            if (g.input.right) {
                this.x = this.old_x + 80;
                this.selected = 1;  //否
                new SoundManage(g.resource['select']);
            } else if (g.input.left) {
                this.x = this.old_x;
                this.selected = 0;  //是
                new SoundManage(g.resource['select']);
            }
        } else {//竖向选择
            if(g.input.down) {
                if(this.keyCount++ === 1) {
                    this.selected++;
                    this.selected = Math.min(this.selected, this.number);
                    if (this.selected <= this.number) {
                        this.y = this.old_y + this.selected * this.step;
                    }
                    new SoundManage(g.resource['select']);
                }
            } else if(g.input.up) {
                if(this.keyCount++ === 1) {
                    this.selected--;
                    this.selected = Math.max(this.selected, 0);
                    if (this.selected >= 0) {
                        this.y = this.old_y + this.selected * this.step;
                    }
                    new SoundManage(g.resource['select']);
                }
            } else this.keyCount = 0;
        }
    }
});

//混合选择菜单(可竖向、横向选择)
var cursor2 = enchant.Class.create(enchant.Sprite,{
    initialize:function(x,y,number,verticalStep,horizonalStep) {
        enchant.Sprite.call(this,20,20);
        this.old_x = x;
        this.old_y = y;
        this.x = x;
        this.y = y;
        this.number = number - 1;
        this.verticalStep = verticalStep;
        this.horizonalStep = horizonalStep;
        this.keyCount = 0;
        this.selected = 0;
        this.image = g.assets[g.resource['cursor']];

        return this;
    },
    onenterframe:function() {
        if(g.input.down) {
            if(this.keyCount++ === 1) {
                this.selected += 2;
                this.selected = Math.min(this.selected, this.number);
                if (this.selected <= this.number) {
                    this.y = this.old_y + Math.floor(this.selected / 2) * this.verticalStep;
                }
                new SoundManage(g.resource['select']);
            }
        } else if(g.input.up) {
            if(this.keyCount++ === 1) {
                this.selected -= 2;
                this.selected = Math.max(this.selected, 0);
                if (this.selected >= 0) {
                    this.y = this.old_y + Math.floor(this.selected / 2) * this.verticalStep;
                }
                new SoundManage(g.resource['select']);
            }
        } else if(g.input.left) {
            if(this.keyCount++ === 1) {
                this.selected--;
                if(this.selected <= 0) {
                    this.selected = Math.max(this.selected, 0);
                } else {
                    this.selected = Math.max(this.selected, 2);
                }

                this.x = this.old_x + this.selected % 2 * this.horizonalStep;

                new SoundManage(g.resource['select']);
            }
        } else if(g.input.right) {
            if(this.keyCount++ === 1) {
                this.selected++;
                if(this.y === this.old_y) {
                    this.selected = Math.min(this.selected, 1);
                    this.x = this.old_x + this.selected * this.horizonalStep;
                } else {
                    this.selected = Math.min(this.selected, this.number);
                    this.x = this.old_x + this.selected % 2 * this.horizonalStep;
                }

                new SoundManage(g.resource['select']);
            }
        } else this.keyCount = 0;
    }
});

/**
 * 过渡场景
 * @type {Sprite}
 */
var TransitionScene = enchant.Class.create(enchant.Scene,{
    initialize:function(width,height,callback,leaveCoordinate) {
        enchant.Scene.call(this);

        this.sprite = new Sprite(width,height);
        this.sprite.backgroundColor = '#000';
        this.sprite.opacity = 0;
        this.leaveCoordinate = leaveCoordinate;
        this.waitFor = this.sprite.age + 20;
        this.callback = callback;
        new SoundManage(g.resource['music05']);

        this.addChild(this.sprite);

        g.pushScene(this);
    },
    onenterframe:function() {
        if(this.sprite.opacity <= 1) this.sprite.opacity += 0.1;
        else {
            if(this.sprite.age > this.waitFor) {
                g.popScene();
                this.callback && this.callback(this.leaveCoordinate);
            }
        }
    }
});

var TransitionScene2 = enchant.Class.create(enchant.Scene,{
    initialize:function(width,height,callback,leaveCoordinate) {
        enchant.Scene.call(this);

        this.sprite = new Sprite(width,height);
        this.sprite.backgroundColor = '#fff';
        this.sprite.opacity = 0;
        this.leaveCoordinate = leaveCoordinate;
        this.waitFor = this.sprite.age + 55;
        new SoundManage(g.resource['music07'],false,g.resource['music01']);

        this.callback = callback;
        this.addChild(this.sprite);

        g.pushScene(this);
    },
    onenterframe:function() {
        if(this.sprite.age % 2 === 0) {
            this.sprite.opacity = 0;
        } else {
            this.sprite.opacity = 0.5;
        }

        if(this.sprite.age > this.waitFor) {
            g.popScene();
            this.callback && this.callback(this.leaveCoordinate);
        }

    }
});

var TransitionScene3 = enchant.Class.create(enchant.Scene,{
    initialize:function(width,height,callback) {
        enchant.Scene.call(this);

        this.sprite = new Sprite(width,height);
        this.sprite.backgroundColor = '#000';
        this.sprite.opacity = 1;
        this.waitFor = this.sprite.age + 20;

        this.callback = callback;
        this.addChild(this.sprite);

        g.pushScene(this);
    },
    onenterframe:function() {
        if(this.sprite.age > this.waitFor) {
            g.popScene();
            this.callback && this.callback();
        }
    }
});

//显示文字
var itemLabel = enchant.Class.create(enchant.Label,{
    initialize:function(text,x,y,color,font,textAlign,visible,width,height) {
        enchant.Label.call(this,text);
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.font = font;
        this.textAlign = textAlign;
        this.visible = visible;

        return this;
    }
});

//卖道具
function sellItem(itemList,scene,dialog) {
    var playerNames = [];
    var keyCount = 0;
    var playerScene = new Scene();
    g.playerList.forEach(function(o) {
        playerNames.push(o.player.name);
    });
    var selectName = new choiceText3(playerNames,35,138,playerNames.length);
    playerScene.addChild(selectName);
    g.pushScene(playerScene);

    playerScene.on('enterframe',function() {
        disPlayGold();
        if(g.input.a) {
            if(keyCount++ === 1) {
                new SoundManage(g.resource['select']);
                var items = g.playerList[selectName.cursor.selected].player.items;
                var itemGroup;
                var itemScene;
                var sellBg,sellText;
                if(items.length === 0) {
                    itemScene = new Scene();
                    itemGroup = new Group();
                    sellBg = new backSprite(g.width, 150, 0, 300, 'black', 1);
                    sellText = new itemLabel('背包里什么也没有~', 10, 310, 'white', '20px Microsoft YaHei',
                        'left', true, 600, 150);

                    itemGroup.addChild(sellBg);
                    itemGroup.addChild(sellText);

                    itemScene.addChild(itemGroup);
                    g.pushScene(itemScene);

                    setTimeout(function() {
                        g.popScene();
                    },1000);

                } else {
                    itemScene = new Scene();
                    itemGroup = new Group();
                    var group = new Group();
                    var labelGroup = new Group();
                    var descGroup = new Group();

                    sellBg = new backSprite(g.width, 150, 0, 300, 'black', 1);
                    sellText = new itemLabel('卖什么?', 10, 310, 'white', '20px Microsoft YaHei',
                        'left', true, 600, 150);
                    var sellItemBg = new backSprite(350, 110, 110, 0);
                    var descSprite = new backSprite(130,110,470,0);
                    group.addChild(sellItemBg);
                    group.addChild(descSprite);

                    //表示处在可见区域内的item索引
                    var inView = [];
                    if(items.length > 4) {
                        inView = [0,1,2,3];
                    } else {
                        inView = [];
                        items.forEach(function(o,i) {
                            inView.push(i);
                        });
                    }
                    var c = new cursor(130,8,'vertical',inView.length,26);

                    //上下箭头
                    var triangle_up = new triangle(285,3,'triangle_up');
                    var triangle_down = new triangle(285,102,'triangle_down');

                    var index = 0;  //选中物品的索引
                    //道具说明文字
                    var descText = [];

                    items.forEach(function (o, i) {
                        var label_1 = new itemLabel(o.name,160,5 + i * 26,'white','16px Microsoft YaHei',
                            'left',inView.indexOf(i) !== -1);
                        var label_2 = new itemLabel((parseInt(o.cost)/2>>0)+'G',330,8 + i * 26,'white','16px Arial',
                            'right',inView.indexOf(i) !== -1,100);

                        //将过长的说明分段显示
                        var tempString = [];
                        Array.prototype.forEach.call(o.description,function(o,i) {
                            tempString.push(o);
                            if(i !== 0 && i % 7 === 0) {
                                tempString.push('<br/>');
                            }
                        });
                        //首次加载所有说明，并显示对应说明，其余隐藏
                        descText[i] = new itemLabel(tempString.join(''),475,5,'white',
                            '14px Microsoft YaHei','left',i === inView[c.selected]);

                        labelGroup.addChild(label_1);
                        labelGroup.addChild(label_2);
                        descGroup.addChild(descText[i]);
                    });
                    group.addChild(sellBg);
                    group.addChild(sellText);


                    group.addChild(triangle_up);
                    group.addChild(triangle_down);
                    group.addChild(c);

                    itemScene.addChild(group);
                    itemScene.addChild(labelGroup);
                    itemScene.addChild(descGroup);
                    g.pushScene(itemScene);

                    //商品选单
                    var selectItem = function() {
                        itemGroup && g.currentScene.removeChild(itemGroup);
                        itemGroup = new Group();
                        labelGroup && g.currentScene.removeChild(labelGroup);
                        descGroup && g.currentScene.removeChild(descGroup);
                        descGroup = new Group();

                        inView.forEach(function(o,i) {
                            var itemName = items[o].name,
                                itemCost = items[o].cost;

                            var label_1 = new itemLabel(itemName,160,5 + i * 26,'white','16px Microsoft YaHei',
                                'left',true);
                            var label_2 = new itemLabel((parseInt(itemCost)/2>>0)+'G',330,8 + i * 26,'white','16px Arial',
                                'right',true,100);

                            itemGroup.addChild(label_1);
                            itemGroup.addChild(label_2);

                            itemScene.addChild(itemGroup);
                        });
                        //更新物品说明
                        descText.forEach(function(o,i) {
                            o.visible = i === inView[c.selected];
                            descGroup.addChild(o);
                            itemScene.addChild(descGroup);
                        });
                    };
                    var refresh = false;
                    itemScene.on('enterframe',function() {
                        if(refresh) {
                            selectItem();
                            disPlayGold();
                            refresh = false;
                        }

                        triangle_up.visible = inView[0] !== 0;
                        triangle_down.visible = inView[inView.length - 1] !== (items.length - 1);

                        if(g.input.down) {
                            if(keyCount++ === 1) {
                                index++;
                                index = Math.min(index,items.length - 1);
                                if(index > inView[inView.length - 1] && items.length > 4) {
                                    inView.shift();
                                    inView.push(index);
                                    selectItem();
                                }

                                descText.forEach(function(o,i) {o.visible = i === inView[c.selected];});
                            }
                        } else if(g.input.up) {
                            if(keyCount++ === 1) {
                                index--;
                                index = Math.max(index,0);
                                if(index < inView[0] && items.length > 4) {
                                    inView.pop();
                                    inView.unshift(index);
                                    selectItem();
                                }
                                descText.forEach(function(o,i) {o.visible = i === inView[c.selected];});
                            }
                        } else if(g.input.a) {
                            if(keyCount++ === 1) {
                                new SoundManage(g.resource['select']);
                                var currentItem = items[inView[Math.min(c.selected,inView.length - 1)]]; //当前选中的商品
                                var newBg = new backSprite(g.width, 150, 0, 300, 'black', 1);    //创建新背景
                                //将对话中的占位符替换成真实数据
                                var confirmText = dialog['dialog_6'].text.replace('{itemName}', currentItem.name)
                                    .replace('{itemCost}', (parseInt(currentItem.cost)/2>>0)+'G');
                                var confirmTxtLabel = new itemLabel(confirmText, 10, 310, 'white',
                                    '20px Microsoft YaHei','left', true, 600, 150);   //创建文字Label
                                var choice = new choiceText(dialog['dialog_6'].options, 35, 350);   //创建选项

                                var confirmGroup = new Group(); //新组
                                confirmGroup.addChild(newBg);
                                confirmGroup.addChild(confirmTxtLabel);
                                confirmGroup.addChild(choice);

                                var confirmScene = new Scene(); //新场景
                                confirmScene.addChild(confirmGroup);

                                g.pushScene(confirmScene);  //添加新场景

                                confirmScene.on('enterframe',function() {
                                    if(g.input.a) {
                                        if(keyCount++ === 1) {
                                            new SoundManage(g.resource['select']);
                                            var c_select = choice.cursor.selected;

                                            if(c_select === 0) {//确认卖
                                                var sellScene = new Scene();
                                                var sellBg = new backSprite(g.width,150,0,300,'black',1);
                                                var sellResult = new itemLabel('钱拿好~',10,310,
                                                    'white','20px Microsoft YaHei',
                                                    'left',true,600,150);
                                                g.gp += parseInt(currentItem.cost) / 2 >> 0;
                                                //从物品列表中移除该物品
                                                deleteItems(items,currentItem,descText);
                                                new SoundManage(g.resource['buy']);
                                                index = 0;
                                                if(items.length > 4) {
                                                    inView = [0,1,2,3];
                                                } else {
                                                    inView = [];
                                                    items.forEach(function(o,i) {
                                                        inView.push(i);
                                                    });
                                                }

                                                refresh = true;

                                                sellScene.addChild(sellBg);
                                                sellScene.addChild(sellResult);
                                                g.pushScene(sellScene);

                                                setTimeout(function() {
                                                    g.popScene();
                                                    g.popScene();
                                                    //若背包中没有物品了
                                                    if(items.length === 0) g.popScene();
                                                    c.selected = 0;
                                                    c.y = c.old_y;
                                                },1000);
                                            } else {//不卖
                                                g.popScene();
                                            }
                                        }
                                    } else if(g.input.b) {//不卖
                                        if(keyCount++ === 1) {
                                            g.popScene();
                                        }
                                    } else keyCount = 0;
                                });
                            }
                        } else if(g.input.b) {
                            if(keyCount++ === 1) {
                                scene.choice.cursor.visible = true;
                                g.popScene();
                            }
                        } else keyCount = 0;
                    });
                }
            }
        } else if(g.input.b) {
            if(keyCount++ === 1) {
                scene.choice.cursor.visible = true;
                g.popScene();
            }
        } else keyCount = 0;
    });
}

//展示商品
function showItemList(itemList,scene,dialog) {
    var group = new Group();
    var labelGroup = new Group();
    var itemGroup = new Group();
    //背景
    var sprite = new backSprite(350,110,110,0);
    var descSprite = new backSprite(130,110,470,0);

    //表示处在可见区域内的item索引
    var inView = [0,1,2,3];
    //x,y,isVertical,number,step
    var c = new cursor(130,8,'vertical',4,26);

    //上下箭头
    var triangle_up = new triangle(285,3,'triangle_up');
    var triangle_down = new triangle(285,102,'triangle_down');

    var len = itemList.length;
    var index = 0;  //选中物品的索引
    var keyCount = 0;
    //道具说明文字
    var descText = [];

    group.addChild(triangle_up);
    group.addChild(triangle_down);
    group.addChild(c);

    itemList.forEach(function(o,i) {
        var label_1 = new itemLabel(o.name,160,5 + i * 26,'white','16px Microsoft YaHei',
            'left',inView.indexOf(i) !== -1);

        var label_2 = new itemLabel(o.cost,330,8 + i * 26,'white','16px Arial',
            'right',inView.indexOf(i) !== -1,100);

        //将过长的说明分段显示
        var tempString = [];
        Array.prototype.forEach.call(o.description,function(o,i) {
            tempString.push(o);
            if(i !== 0 && i % 7 === 0) {
                tempString.push('<br/>');
            }
        });
        //首次加载所有说明，并显示对应说明，其余隐藏
        descText[i] = new itemLabel(tempString.join(''),475,5,'white',
            '14px Microsoft YaHei','left',i === inView[c.selected]);

        labelGroup.addChild(label_1);
        labelGroup.addChild(label_2);
        group.addChild(descText[i]);
    });

    var newScene = new Scene();
    newScene.addChild(sprite);
    newScene.addChild(descSprite);
    newScene.addChild(group);
    newScene.addChild(labelGroup);

    g.pushScene(newScene);


    //商品选单
    var selectItem = function() {
        itemGroup && g.currentScene.removeChild(itemGroup);
        itemGroup = new Group();
        labelGroup && g.currentScene.removeChild(labelGroup);

        inView.forEach(function(o,i) {
            var itemName = itemList[o].name,
                itemCost = itemList[o].cost;

            var label_1 = new itemLabel(itemName,160,5 + i * 26,'white','16px Microsoft YaHei',
                'left',true);
            var label_2 = new itemLabel(itemCost,330,8 + i * 26,'white','16px Arial',
                'right',true,100);

            itemGroup.addChild(label_1);
            itemGroup.addChild(label_2);

            newScene.addChild(itemGroup);
        });

    };

    newScene.on('enterframe',function() {
        triangle_up.visible = inView[0] !== 0;
        triangle_down.visible = inView[inView.length - 1] !== (len - 1);

        if(g.input.down) {
            if(keyCount++ === 1) {
                index++;
                index = Math.min(index,len - 1);
                if(index > inView[3]) {
                    inView.shift();
                    inView.push(index);
                    selectItem();
                }
                descText.forEach(function(o,i) {o.visible = i === inView[c.selected];});
            }
        } else if(g.input.up) {
            if(keyCount++ === 1) {
                index--;
                index = Math.max(index,0);
                if(index < inView[0]) {
                    inView.pop();
                    inView.unshift(index);
                    selectItem();
                }
                descText.forEach(function(o,i) {o.visible = i === inView[c.selected];});
            }
        } else if(g.input.a) {
            if(keyCount++ === 1) {
                new SoundManage(g.resource['select']);
                var currentItem = itemList[inView[c.selected]]; //当前选中的商品
                var newBg = new backSprite(g.width,150,0,300,'black',1);    //创建新背景
                var confirmText = dialog['dialog_5'].text.replace('{itemName}',currentItem.name)
                    .replace('{itemCost}',currentItem.cost);    //将对话中的占位符替换成真实数据
                var confirmTxtLabel = new itemLabel(confirmText,10,310,'white','20px Microsoft YaHei',
                    'left',true,600,150);   //创建文字Label
                var choice = new choiceText(dialog['dialog_5'].options, 35, 350);   //创建选项

                var confirmGroup = new Group(); //新组
                confirmGroup.addChild(newBg);
                confirmGroup.addChild(confirmTxtLabel);
                confirmGroup.addChild(choice);

                var confirmScene = new Scene(); //新场景
                confirmScene.addChild(confirmGroup);

                g.pushScene(confirmScene);  //添加新场景


                //为新场景监听事件
                confirmScene.on('enterframe',function() {
                    if(g.input.a) {
                        if(keyCount++ === 1) {
                            new SoundManage(g.resource['select']);
                            var c_select = choice.cursor.selected;

                            if(c_select === 0) {
                                var buyScene = new Scene();
                                var buyText = '';
                                var buyResult;
                                var buyBg = new backSprite(g.width,150,0,300,'black',1);
                                var buyGroup = new Group();
                                if(g.gp >= parseInt(currentItem.cost)) {
                                    buyText = '钱正好,装在谁的包里呢?';
                                    buyResult = new itemLabel(buyText,10,310,'white','20px Microsoft YaHei',
                                        'left',true,600,150);

                                    var playerNames = [];
                                    g.playerList.forEach(function(o) {
                                        playerNames.push(o.player.name);
                                    });
                                    var selectName = new choiceText3(playerNames,35,138,playerNames.length);

                                    buyGroup.addChild(buyBg);
                                    buyGroup.addChild(buyResult);
                                    buyGroup.addChild(selectName);
                                    buyScene.addChild(buyGroup);
                                    g.pushScene(buyScene);

                                    buyScene.on('enterframe',function() {
                                        if(g.input.a) {
                                            if(keyCount++ === 1) {
                                                var curPlayer = g.playerList[selectName.cursor.selected].player;
                                                if(curPlayer.items.length < curPlayer.maxItemsCount) {
                                                    g.gp -= parseInt(currentItem.cost);
                                                    curPlayer.items.push(currentItem);


                                                    new SoundManage(g.resource['buy']);
                                                    var buySuccess = new itemLabel('请拿好~',10,310,
                                                        'white','20px Microsoft YaHei',
                                                        'left',true,600,150);
                                                    var buySuccessBg = new backSprite(g.width,150,0,300,'black',1);
                                                    var buySuccessScene = new Scene();
                                                    buySuccessScene.addChild(buySuccessBg);
                                                    buySuccessScene.addChild(buySuccess);
                                                    g.pushScene(buySuccessScene);

                                                    setTimeout(function() {
                                                        g.popScene();
                                                        g.popScene();
                                                        g.popScene();
                                                        disPlayGold();
                                                    },1000);
                                                } else {
                                                    var buyFail = new itemLabel('背包已经满了,换个人拿吧.',10,310,
                                                        'white','20px Microsoft YaHei',
                                                        'left',true,600,150);
                                                    var buyFailBg = new backSprite(g.width,150,0,300,'black',1);
                                                    var buyFailScene = new Scene();
                                                    buyFailScene.addChild(buyFailBg);
                                                    buyFailScene.addChild(buyFail);
                                                    g.pushScene(buyFailScene);
                                                    setTimeout(function() {
                                                        g.popScene();
                                                    },1000);
                                                }
                                            }
                                        } else if(g.input.b) {
                                            if(keyCount++ === 1) {
                                                g.popScene();
                                                g.popScene();
                                            }
                                        } else keyCount = 0;
                                    });
                                } else {
                                    buyText = '钱不够啊,挑一个买得起的吧!';
                                    buyResult = new itemLabel(buyText,10,310,'white','20px Microsoft YaHei',
                                        'left',true,600,150);
                                    buyGroup.addChild(buyBg);
                                    buyGroup.addChild(buyResult);
                                    buyScene.addChild(buyGroup);
                                    g.pushScene(buyScene);

                                    setTimeout(function() {
                                        g.popScene();
                                        g.popScene();
                                    },1500);
                                }
                            }
                            if(c_select === 1) {
                                g.popScene();
                            }
                        }
                    } else if(g.input.b) {//退出到上一场景
                        if(keyCount++ === 1) {
                            g.popScene();
                        }
                    } else keyCount = 0;
                });

            }
        } else if(g.input.b) {
            if(keyCount++ === 1) {
                scene.choice.cursor.visible = true;
                g.popScene();
            }
        } else keyCount = 0;
    });
}

//显示金钱
function disPlayGold() {
    disPlayGold.gpSprite = new backSprite(150,30,450,270,'black',1);
    disPlayGold.gpText = new itemLabel(g.gp+'G',450,275,'white','18px Arial','right',true,140,30);

    disPlayGold.gpSprite && g.currentScene.removeChild(disPlayGold.gpSprite);
    disPlayGold.gpText && g.currentScene.removeChild(disPlayGold.gpText);

    g.currentScene.addChild(disPlayGold.gpSprite);
    g.currentScene.addChild(disPlayGold.gpText);
}

//删除物品
function deleteItems(itemList,removeItem,descText) {
    for(var i = 0; i < itemList.length; i++) {
        if(itemList[i].name === removeItem.name) {
            itemList.splice(i,1);
            descText.splice(i,1);
            break;
        }
    }
}

function makeArray(array) {
    var arr = [];
    for(var i = 0; i < array.length; i++) {
        if(array[i] instanceof Array) {
            arr = arr.concat(makeArray(array[i]));
        } else {
            arr = arr.concat(array[i]);
        }
    }
    return arr;
}

function gameOver() {
    var gameover = new triangle(205,152,'gameover',189,97);
    var overScene = new Scene();
    overScene.addChild(gameover);
    g.pushScene(overScene);
}