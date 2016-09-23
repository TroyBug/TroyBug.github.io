/**
 * Created by Troy on 2016/9/12.
 */
function battle(enemyGroupID,firstEnemy) {
    new TransitionScene2(g.width,g.height,function() {
        addBattleScene(enemyGroupID);
        battle.firstEnemy = firstEnemy;
        battle.isBoss = firstEnemy.isBoss;
        new SoundManage(battle.isBoss ? g.resource['music04'] : g.resource['music09'],true,g.resource['music07']);
    });
}
battle.enemyLoaded = false; //标识敌人是否加载完成
//敌人出现的位置(固定)
battle.enemyLocation = [[40,148],[168,148],[40,84],[168,84],[40,212],[168,212],[40,20],[168,20]];
battle.battleInfo = []; //战斗信息
battle.enemies = [];  //出现的敌人
battle.actionQueue = [];    //行动列表
battle.battleStart = false;
battle.roundEnd = true;
battle.exp = 0; //战斗经验值
battle.gp = 0;  //战斗得到的金钱

//战斗场景
function addBattleScene(enemyGroupID) {
    var scene = new Scene();
    var group;
    var keyCount = 0;

    battle.battleInfo = [];
    addBattleScene.group_1 = [];
    addBattleScene.group_2 = [];

    var bg = new backSprite(g.width,g.height,0,0,'black',1);
    var line1 = new backSprite(g.width,1,0,300,'white',1);
    var line2 = new backSprite(1,100,200,300,'white',1);
    var line3 = new backSprite(200,1,0,330,'white',1);
    var line4 = new backSprite(1,100,450,300,'white',1);

    //玩家操作选项
    var opLabel = new itemLabel('攻击',35,340,'white','16px Microsoft YaHei','left',true,50,30);
    var opLabel2 = new itemLabel('道具',120,340,'white','16px Microsoft YaHei','left',true,50,30);
    var opLabel3 = new itemLabel('防卫',35,370,'white','16px Microsoft YaHei','left',true,50,30);
    var opLabel4 = new itemLabel('逃跑',120,370,'white','16px Microsoft YaHei','left',true,50,30);

    var choice = new cursor2(12,342,4,31,85);
    addBattleScene.group_2.push(choice);

    //玩家信息
    var playerName = new itemLabel('Adol',22,308,'white','14px Arial','left',true,80,30);
    var playerWeapon = new itemLabel(p1.player.equip[0].name,110,306,'white','14px Microsoft YaHei','left',true,100,30);
    var playerName2 = new itemLabel('Adol',460,308,'white','14px Arial','left',true,80,30);
    var p1Hp = new itemLabel('HP'+p1.hp,540,308,'white','14px Arial','left',true,100,30);

    battle.p1Hp = p1Hp;

    var p1Battle = new triangle(540,150,'player1_battle',30,32);    //战斗姿势
    var p1Weapon = new triangle(542,160,'weapon01',16,6,2,2);   //武器

    battle.p1Battle = p1Battle;

    addBattleScene.group_2.push(p1Weapon);
    p1Weapon.visible = false;


    group = addToStage([bg,line1,line2,line3,line4,opLabel,opLabel2,opLabel3,opLabel4,choice,playerName,playerWeapon,
        playerName2,p1Hp,p1Battle,p1Weapon]);

    scene.addChild(group);
    g.pushScene(scene);

    //敌人随机出现
    selectEnemy(enemyGroupID);

    scene.on('enterframe',function() {
        if(g.input.a && choice.visible) {
            if(keyCount++ === 1 && battle.enemyLoaded) {
                new SoundManage(g.resource['select']);
                removeComponents(addBattleScene.group_1);

                switch (choice.selected) {
                    case 0://攻击
                        if(battle.damageInfo) g.currentScene.removeChild(battle.damageInfo);

                        var enemyNameGroup = displayGroupEnemy(battle.enemies);
                        var selectEnemyScene = new Scene();
                        var selectEnemy = new cursor(210,308,'vertical',enemyNameGroup[1],20);
                        choice.visible = false;

                        selectEnemyScene.addChild(enemyNameGroup[0]);
                        selectEnemyScene.addChild(selectEnemy);
                        g.pushScene(selectEnemyScene);

                        selectEnemyScene.on('enterframe',function() {
                            if(g.input.b) {
                                if(keyCount++ === 1) {
                                    new SoundManage(g.resource['select']);
                                    g.popScene();
                                    choice.visible = true;
                                }
                            } else if(g.input.a) {
                                if(keyCount++ === 1) {//选择要攻击的敌人
                                    new SoundManage(g.resource['select']);
                                    var emy_select = enemyNameGroup[2][selectEnemy.selected];

                                    var emyList = battle.enemies.filter(function (o) {
                                        return o.id.toString() === emy_select;
                                    });
                                    if(emyList.length > 1) {
                                        //若该种类的敌人有多个，则赋予编号(敌人A、敌人B)
                                        emyList.forEach(function(o,i) {
                                            o.aliasName = '';
                                            o.aliasName += o.name + enemySign[i];
                                        });
                                    } else {
                                        emyList[0].aliasName = emyList[0].name;
                                    }

                                    g.popScene();
                                    //战斗
                                    fight(emyList,p1.player.equip[0].special);


                                }
                            } else keyCount = 0;
                        });
                        break;
                    case 1:
                        break;
                    case 2:
                        break;
                    default://逃跑
                        //逃跑成功率计算公式：F = (A * 32) / B + 30 * C
                        /*A为逃跑方的当前速度，包含加速buff。
                          B为对方的当前速度(或取对方的速度平均值)除以4再对256取余。
                            C为本次战斗中逃跑方已经尝试过的逃跑次数，包括正在进行的这一次逃跑。
                        若F大于255，则逃跑成功。否则在0到255之间生成一個随机数D。若D小于F则逃跑成功，否则逃跑失败。
                        若使用道具或某些特性逃跑必定成功*/
                        new SoundManage(g.resource['music14'],false,null,1);

                        g.popScene();
                        battle.gp = 0;
                        battle.exp = 0;
                        new TransitionScene3(g.width,g.height,function() {
                            new SoundManage(g.resource['music01'],true,g.resource['music09']);
                            battle.enemies = [];
                            battle.enemyLoaded = false;
                            battle.battleInfo = [];
                        });

                        break;
                }
            }
        } else keyCount = 0;
    });
}


function addComponentsToArray(array) {
    for(var i = 1; i < arguments.length; i++) {
        if(arguments[i] instanceof Array) {
            arguments[i].forEach(function(o) {
                array.push(o);
            });
        } else {
            array.push(arguments[i]);
        }
    }
}

function hideComponents(array) {
    array.forEach(function(o) {
        o.visible = false;
    });
}
function removeComponents(array) {
    array.forEach(function(o) {
        g.currentScene.removeChild(o);
    });
    array.length = 0;
}
function showComponents(array) {
    array.forEach(function(o) {
        o.visible = true;
    });
}

//选择随机敌人
function selectEnemy(groupNumber) {
    var enemies = enemyGroup[groupNumber];
    var enemyNumber = rangeRand(enemies.min,enemies.max);   //出现敌人的数量
    var candidate = []; //候选敌人列表
    var enemyList = []; //敌人列表

    //若候选敌人列表中为空，则表示候选敌人为全体类型的敌人
    if(enemies.enemies.length === 0) {
        candidate = enemyConfig.candidate;
        if(enemies.exclude.length !== 0) {  //需要排除的敌人
            enemies.exclude.forEach(function(o) {
                var index = candidate.indexOf(o);
                if(index > -1) {
                    candidate.splice(index,1);
                }
            });
        }
    } else {
        candidate = enemies.enemies;
    }

    //在候选列表中提选出相应数量的敌人
    for(var i = 0; i < enemyNumber; i++) {
        enemyList.push(candidate[rand(candidate.length)]);
    }

    var groupEnemy = generateEnemy(enemyList);
    var enemyNames = [];

    groupEnemy.forEach(function(o) {
        enemyNames.push(o[0].name);
    });

    //建立一个保存敌人位置的数组的副本
    var location = battle.enemyLocation.slice(0);
    var groupCount = 0; //敌人分组编号

    setTimeout(function() {
        (function displayEmy() {
            if(groupEnemy.length) {
                var el = groupEnemy.shift();

                (function() {
                    if(el.length) {
                        var child = el.shift();
                        g.currentScene.addChild(child.draw(location[0][0],location[0][1]));
                        battle.enemies.push(child);
                        location.shift();
                        new SoundManage(g.resource['music11']);
                        setTimeout(arguments.callee,300);
                    } else {
                        //怪物出现时显示的文字信息
                        var info = new itemLabel(enemyNames[groupCount] +' 出现了!<br/>',
                            220,308 + 20 * groupCount,'white','14px Microsoft YaHei','left',true,180,30);
                        battle.battleInfo.push(info);
                        addComponentsToArray(addBattleScene.group_1,battle.battleInfo);
                        g.currentScene.addChild(info);
                        groupCount++;
                        setTimeout(displayEmy,500);
                    }
                })();

            } else {
                /*if(isForestall()) {
                    var info = new itemLabel('但怪物还没有发现Adol!<br/>',
                        220,308 + 20 * groupCount,'white','14px Microsoft YaHei','left',true,180,30);
                    battle.battleInfo.push(info);
                    addComponentsToArray(addBattleScene.group_1,battle.battleInfo);
                    g.currentScene.addChild(info);
                }*/
                battle.enemyLoaded = true;
            }
        })();
    },200);
}

//实例化列表中的敌人
function generateEnemy(enemyList) {
    var list = [];
    var enemyNumber = enemyList.length;
    var groupNumber;    //分若干组
    var group_1 = [];
    var group_2 = [];
    var group_3 = [];

    enemyList.forEach(function(o) {
        var enemy = new Enemy(enemyConfig[o]);
        list.push(enemy);
    });

    //将敌人分组
    if(enemyNumber === 1) {//当敌人列表中只有一个敌人
        group_1.push(list[0]);
        return [group_1];
    } else if(enemyNumber === 2) {//当敌人列表中有两个敌人
        groupNumber = rangeRand(1,2);   //随机分为一组或两组
        if(groupNumber === 2) {
            group_1.push(list[0]);
            group_2.push(list[1]);
            return [group_1,group_2];
        } else {
            group_1.push(list[0]);
            group_1.push(list[1]);
            return [group_1];
        }
    } else {//敌人列表中有三个或三个以上敌人
        groupNumber = rangeRand(1,3);   //随机分为一、二或三组
        if(groupNumber === 3) {//三组
            list.forEach(function(o,i) {
                if(i === 0) group_1.push(list[i]);
                else if(i === 1) group_2.push(list[i]);
                else group_3.push(list[i]);
            });
            return [group_1,group_2,group_3];
        } else if(groupNumber === 2) {//两组
            list.forEach(function(o,i) {
                if(i === 0) group_1.push(list[i]);
                else group_2.push(list[i]);
            });
            return [group_1,group_2];
        } else {
            list.forEach(function(o,i) {
                group_1.push(list[i]);
            });
            return [group_1];
        }
    }
}

//选择要攻击的怪物
function displayGroupEnemy(enemyList) {
    var enemies = unique(enemyList,'id','name');
    var index = 0;
    var group = new Group();
    for(var i in enemies) {
        var enemyName = new itemLabel(enemies[i].name,240,306 + 20 * index,'white',
            '14px Microsoft YaHei','left',true,80,30);
        var enemyNumber = new itemLabel(enemies[i].count,320,306 + 21 * index,
            'white','14px Microsoft YaHei','left',true,15,28);
        index++;

        group.addChild(enemyName);
        group.addChild(enemyNumber);
    }

    return [group,index,Object.keys(enemies)];
}

/**
 * 将重复的数组元素合并并统计出现次数
 * @param array {Array} 待合并数组
 * @param property  {string} 按数组中元素的某个属性排列
 * @param name  {string} 数组元素的名称
 * @returns {{统计集合}}
 */
function unique(array,property,name) {
    var ret = {};

    for(var i = 0; i < array.length; i++){
        var item = array[i][property];

        if(!ret[item]){
            ret[item] = {};
            ret[item].count = 1;
            ret[item][name] = array[i][name];
        } else {
            ret[item].count++;
        }
    }

    return ret;
}

function fight(emyList,ability) {
    //ability = 'one';
    var target;

    if(emyList.length === 1) {
        target = [emyList[0]];
    } else {
        if(ability === 'group') {//若武器可以攻击一组敌人
            target = emyList;   //则将目标设为该组敌人
        } else {//否则随机从该组敌人中选择一个
            target = [emyList[rand(emyList.length)]];
        }
    }

    //按速度大小排序，速度快的先攻
    battle.actionQueue = battle.enemies.concat(p1).sort(function(a,b) {
        return a.getSpeed() < b.getSpeed();
    });

    /*if(isForestall() && !battle.battleStart) {
        battle.actionQueue = [p1];    //先制攻击
        battle.battleStart = true;
    } else if(isSneak() && !battle.battleStart) {
        battle.actionQueue = battle.enemies;  //被偷袭
        battle.battleStart = true;
    }*/

    console.log('行动列表:',battle.actionQueue);
    (function actionByQueue() {
        if(battle.actionQueue.length && battle.roundEnd) {
            var el = battle.actionQueue.shift();

            if(el.constructor === Player) {//如果等于玩家则表示轮到玩家行动
                fightAnimation(target,function() {
                    actionByQueue();
                });
            } else {//敌方行动
                el.actions(p1,function() {
                    actionByQueue();
                });
            }
        } else {
            addBattleScene.group_2[1].visible = false;  //隐藏武器
            addBattleScene.group_2[0].visible = true;   //显示手形指针
        }
    })();
}

function fightAnimation(target,callback) {
    battle.roundEnd = false;
    addBattleScene.group_2[1].visible =  true;  //显示武器

    var centerArray = [];   //用于保存该组敌人的中心位置

    target.forEach(function(o){
        centerArray.push(o.getCenterPoint());
    });


    var info = new itemLabel(p1.player.name +'攻击!',
        220,308,'white','14px Microsoft YaHei','left',true,180,30);
    var p1WeaponAmmo = new triangle(518,162,'ammo',21,7,1,1);   //弹药
    p1WeaponAmmo.visible = false;
    var animationScene = new Scene();

    animationScene.addChild(info);
    animationScene.addChild(p1WeaponAmmo);

    var waitFor = animationScene.age + 20;
    var finish = false;
    var explosionRunning = false;
    var idx_target = 0;

    g.pushScene(animationScene);

    animationScene.on('enterframe',function() {
        if(this.age >= waitFor && !finish) {
            finish = true;
            new SoundManage(g.resource['music12'],false,null,1);
            p1WeaponAmmo.visible =  true;
        }
        if(p1WeaponAmmo.visible === true) {
            p1WeaponAmmo.tl.moveTo(centerArray[0][0],centerArray[0][1],20);
        }
        if(Math.abs(p1WeaponAmmo.x - centerArray[0][0]) < 0.1 &&
            Math.abs( p1WeaponAmmo.y - centerArray[0][1]) < 0.1 &&
            p1WeaponAmmo.visible === true) {
            //重置子弹位置
            p1WeaponAmmo.x = 518;
            p1WeaponAmmo.y = 162;
            p1WeaponAmmo.visible = false;

            (function effectEx() {
                if(target.length && !explosionRunning) {
                    new SoundManage(g.resource['music13'],false,null,1);
                    explosionRunning = true;
                    var t = target.shift();

                    //爆炸效果
                    var explosion = new triangle(centerArray[idx_target][0] - 30,centerArray[idx_target][1] - 30,
                        'explosion',64,64,1,1);
                    explosion.frame = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,null];
                    animationScene.addChild(explosion);

                    var damage = hitStrength(p1.getAttack());
                    t.hp -= damage;

                    battle.damageInfo = new itemLabel((t.aliasName || t.name) +'损伤了'+damage+'!<br/>',
                        220,308 + 20 * idx_target,'white','14px Microsoft YaHei','left',true,180,30);

                    explosion.on('enterframe',function() {
                        if(this.frame === 24) {
                            animationScene.removeChild(this);
                            animationScene.removeChild(info);
                            g.currentScene.addChild(battle.damageInfo);
                            idx_target++;
                            explosionRunning = false;
                            this.frame = 0;
                            setTimeout(effectEx,10);
                        }
                    });

                    var targetLife = t.age + 20;
                    //监测敌方hp，判断敌方是否已死亡
                    function checkEnemyDead() {
                        if(this.hp <= 0) {
                            if(!this.dead) {
                                new SoundManage(g.resource['music15'],false,null,1);
                                battle.damageInfo.text += '打倒了'+(t.aliasName || t.name)+'!<br/>';
                                g.currentScene.addChild(battle.damageInfo);
                                this.dead = true;
                            }
                            if(this.age <= targetLife) {
                                if(this.age % 2 === 0) {
                                    this.opacity = 0;
                                } else {
                                    this.opacity = 1;
                                }
                            } else {
                                battle.gp += this.gp;
                                battle.exp += this.exp;

                                g.currentScene.removeChild(this);
                                this.removeEventListener('enterframe',checkEnemyDead);
                                //从列表中移除已消灭的敌人
                                for(var i = 0; i < battle.enemies.length; i++) {
                                    var o = battle.enemies[i];
                                    if(o.aliasName !== '' && o.aliasName === t.aliasName) {
                                        battle.enemies.splice(i,1);
                                        break;
                                    }
                                }

                                //从行动队列中移除已经死亡的敌人
                                for(i = 0; i < battle.actionQueue.length; i++) {
                                    var item = battle.actionQueue[i];
                                    if(item.hp <= 0) {
                                        battle.actionQueue.splice(i,1);
                                    }
                                }

                                if(battle.enemies.length === 0) {
                                    g.gp += battle.gp;
                                    g.exp += battle.exp;

                                    var info = new itemLabel('消灭了怪物!<br/>Adol获得了'+battle.exp+
                                        '点经验和<br/>' + battle.gp + 'G!<br/>',
                                        220,308,'white','14px Microsoft YaHei','left',true,180,30);

                                    var currentLevel = p1.player.level;

                                    for(i = currentLevel; i < p1.player.levelStats.length; i++) {
                                        if(currentLevel === p1.player.levelStats.length-1) break;
                                        if(g.exp >= p1.player.levelStats[i].expMax) {
                                            p1.player.level = i;
                                            if(p1.player.level > currentLevel ) {
                                                info.text += 'Adol升级了!<br/>';
                                                currentLevel = p1.player.level;
                                                p1.hp = p1.getHp();
                                            }
                                        }
                                    }
                                    console.log(g.exp,p1.player.level,currentLevel);

                                    battle.gp = 0;
                                    battle.exp = 0;

                                    var battleResultScene = new Scene();

                                    setTimeout(function() {
                                        new SoundManage(g.resource['music17'],false,
                                            battle.isBoss ? g.resource['music04'] : g.resource['music09']);
                                        g.currentScene.removeChild(battle.damageInfo);
                                        battleResultScene.addChild(info);
                                        g.pushScene(battleResultScene);
                                    },400);

                                    var keyCount = 0;
                                    var waitFor = battleResultScene.age + 30;
                                    battleResultScene.on('enterframe',function() {
                                        if(this.age >= waitFor) {
                                            if(g.input.a) {
                                                if(keyCount++ === 1) {
                                                    g.popScene();
                                                    g.popScene();
                                                    battle.enemyLoaded = false;
                                                    if(battle.isBoss) battle.firstEnemy.dead = true;
                                                    new SoundManage(g.resource['music01'],true,g.resource['music17']);
                                                }
                                            } else keyCount = 0;
                                        }
                                    });
                                }
                            }
                        }
                    }

                    t.addEventListener('enterframe',checkEnemyDead);
                } else {
                    setTimeout(function() {
                        g.popScene();
                        addBattleScene.group_2[1].visible = false;  //隐藏武器
                        //addBattleScene.group_2[0].visible = true;   //显示手形指针
                        setTimeout(function() {
                            battle.roundEnd = true;
                            callback && callback();
                        },1200);
                    },1000);
                }
            })();

        }

    });
}

function hitStrength(hit) {
    return Math.round((Math.random() + .5) * hit);
}

//计算敌人的平均速度
function getEmyAverageSpeed() {
    var sumSpeed = 0;
    var len = battle.enemies.length;
    battle.enemies.forEach(function(o) {
        sumSpeed += o.speed;
    });

    return (sumSpeed / len) >> 0;
}

//是否先制攻击
function isForestall() {
    var emyAvgSpeed = getEmyAverageSpeed(battle.enemies);
    var playerSpeed = p1.getSpeed();

    if(playerSpeed >= emyAvgSpeed) {
        if(Math.random() >= 0.8) return true;
    } else {
        if(Math.random() >= 0.9) return true;
    }
    return false;
}

//是否被偷袭
function isSneak() {
    var emyAvgSpeed = getEmyAverageSpeed(battle.enemies);
    var playerSpeed = p1.getSpeed();

    if(emyAvgSpeed >= playerSpeed) {
        if(Math.random() >= 0.5) return true;
    } else {
        if(Math.random() >= 0.8) return true;
    }
    return false;
}