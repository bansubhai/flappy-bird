var Bootstate = {

    preload: function () {
        this.load.image('powerup', 'Images/powerup.png');
    },
    create: function () {
        this.game.state.start('MainState');
    },


}

var MainState = {

    preload: function () {

        this.add.sprite(200, 200, 'powerup')

        alert("Here!")
        //load the assests of level1
    },
    create: function () {

        var x = prompt("Ready for the Game ?")
        if (x == 'yes')
            this.game.state.start('level1')

    },

}

var GameState = {
    //some hidden objects are made by phaser when this state gets started

    init: function () {
        console.log("In init");
        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.physics.arcade.gravity.y = 1000;

        this.cursors = this.input.keyboard.createCursorKeys();
        this.jumpBtn = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        this.world.setBounds(0, 0, 1400, 800)
    },
    preload: function () {
        console.log("In Preload");
        this.load.image('ground', 'Images/greenground.png')
        this.load.image('hill', 'Images/hill.png')
        this.load.image('tree', 'Images/tree.png')
        // this.load.image('background', 'Images2/background.png')

        // this.load.image('player', 'Images2/pika.png')

        this.load.text('level1', 'leveldata/level1.json');

        this.load.spritesheet('player', 'Images/player_spritesheet.png', 28, 30, 5, 1, 1);

        this.load.image('platform', 'Images/platform.png');

        this.load.spritesheet('android', 'Images/android_spritesheet.png', 80, 100, 5, 0, 0);

        this.load.image('ball', 'Images/snow.png');

    },
    create: function () {
        console.log("In Create");

        this.game.state.start('level2');

        // console.log(this);

        // this.add.sprite(0, 0, 'background');

        this.stage.backgroundColor = "#7ec0ee";

        // this.ground = this.add.sprite(0, this.world._height - 50, 'ground');
        this.ground = this.add.tileSprite(0, this.world._height - 50, this.world.width, 50, 'ground');

        // console.log(this.world._height);
        // console.log(this.world.height);

        var hill = this.add.sprite(20, this.world._height - 50, 'hill');
        hill.scale.setTo(2);
        hill.anchor.setTo(0, 1);


        var hill2 = this.add.sprite(450, this.world._height - 50, 'hill');
        hill2.anchor.setTo(0, 1);
        hill2.alpha = 0.5;

        for (let i = 0; i < 5; i++) {
            var tree = this.add.sprite(200 * (i + 1), this.world._height - 50, 'tree');
            tree.anchor.setTo(0, 1);
            // tree.angle = 30;
        }


        this.player = this.add.sprite(0, 20, 'player');
        this.player.scale.setTo(2);
        this.player.frame = 3;

        this.player.animations.add('walking', [0, 1, 2, 1], 6, true);
        this.player.anchor.setTo(0.5, 0.5);

        this.physics.arcade.enable(this.player);
        this.player.body.collideWorldBounds = true;
        this.camera.follow(this.player);
        // this.scoreBox.fixedToCamera = true;
        // this.player.body.setSize(100, 100, 0, 25);     //effective area of body
        this.player.customParams = {
            speed: 200,
            jumpSpeed: -700,
            health: 100,
            direction: 'left',
        };


        this.physics.arcade.enable(this.ground);
        this.ground.body.allowGravity = false;
        this.ground.body.immovable = true;
        // this.ground.body.collideWorldBounds = true;

        // this.platform = this.add.sprite(20, 350, 'platform');
        // this.physics.arcade.enable(this.platform);
        // this.platform.body.allowGravity = false;
        // this.platform.body.immovable = true;

        var textStyle = {
            font: "25px Arial", fill: "#ff0044",
        };
        this.scoreBox = this.add.text(10, 10, "Health: " + this.player.customParams.health, textStyle)
        this.scoreBox.fixedToCamera = true;

        this.platformGroup = this.add.group();
        this.platformGroup.enableBody = true;
        this.addPlatforms();
        this.platformGroup.setAll('body.allowGravity', false);
        this.platformGroup.setAll('body.immovable', true);

        this.ballsGroup = this.add.group();
        this.ballsGroup.enableBody = true;


        //create a ball after every 2 seconds
        this.ballMaker = this.time.events.loop(2000, this.makeBall, this);


        // Phaser.Timer.SECOND


    },

    makeBall: function () {
        // console.log(this);
        // console.log(this.game);
        console.log("making one ball");

        // var ball = this.ballsGroup.create(this.android.x+50, this.android.y+80, 'ball')

        var ball = this.ballsGroup.getFirstExists(false);

        if (!ball) {
            ball = this.ballsGroup.create(this.android.x + 50, this.android.y + 80, 'ball');
        }
        else {
            ball.reset(this.android.x + 40, this.android.y + 80);
        }

        var no = Math.random();

        if (no > 0.7) {
            ball.body.velocity.x = 100;
        }
        else {
            ball.body.velocity.x = -100;
        }

        ball.body.collideWorldBounds = true;
        ball.body.bounce.set(1, 0.5);


    },
    update: function () {
        // console.log("In Update");
        this.player.body.velocity.x = 0;

        this.physics.arcade.overlap(this.ballsGroup, this.player, this.reduceHealth, null, this);
        this.physics.arcade.overlap(this.player, this.android, this.killAndroid, null, this);

        this.ballsGroup.forEach(function (ball, index) {
            if (ball.x >= this.world.width - 20) {
                ball.kill();
            }
        }, this)

        // if(this.android.body)

        this.physics.arcade.collide(this.ballsGroup, [this.ground, this.platformGroup]);

        this.physics.arcade.collide(this.player, this.ground);
        this.physics.arcade.collide(this.player, this.platformGroup, this.jumpPlatform /*function
         to run when colliding*/);


        if (this.cursors.left.isDown) {
            this.player.body.velocity.x = -this.player.customParams.speed;
            this.player.animations.play('walking');

            if (this.player.customParams.direction == 'right') {
                this.player.customParams.direction = 'left'
                this.player.scale.setTo(2, 2);
            }
        }
        else if (this.cursors.right.isDown) {
            this.player.body.velocity.x = this.player.customParams.speed;
            this.player.animations.play('walking');

            if (this.player.customParams.direction == 'left') {
                this.player.customParams.direction = 'right'
                this.player.scale.setTo(-2, 2);
            }
        }
        else {
            this.player.animations.stop('walking');
            this.player.frame = 3;
        }

        if (this.jumpBtn.isDown && this.player.body.touching.down) {
            this.player.body.velocity.y = this.player.customParams.jumpSpeed;
            // this.scoreBox.setText("you Jumped")
        }

    },

    reduceHealth: function () {
        this.player.customParams.health -= 1;
        this.scoreBox.setText("Health: " + this.player.customParams.health);

        if (this.player.customParams.health <= 0) {
            alert("GameOver");
            this.game.state.start('level1');
        }
    },

    killAndroid: function () {
        // this.android.y+=90;

        this.android.scale.setTo(1, .2);

        var tA = this.add.tween(this.android);
        tA.to({alpha: 0}, 2000, "Linear", false /*autostart*/);

        var tB = this.add.tween(this.android.scale);
        tB.to({y: 0.2}, 2000, "Linear", true /*autostart*/);

        tB.chain(tA);
        tA.onComplete.add(this.nextLevel, this);
        // this.android.kill();

        // this.game.state.start('level2');
    },

    nextLevel: function () {
        this.game.state.start('level2');

    },

    addPlatforms: function () {

        this.leveldata = JSON.parse(this.cache.getText('level1'));
        this.platformsArray = this.leveldata.platforms;

        console.log(this.platformsArray);

        this.android = this.add.sprite(this.platformsArray[2].x, this.platformsArray[2].y, 'android');

        this.android.animations.add('kick', [1, 0, 2, 3, 4, 3, 2, 1], 6, true);
        this.android.animations.play('kick');

        this.physics.arcade.enable(this.android);
        this.android.body.allowGravity = false;
        this.android.body.immovable = true;

        for (var i = 0; i < this.platformsArray.length; i++) {
            var x = this.platformsArray[i].x;
            var y = this.platformsArray[i].y + 100;
            this.platformGroup.create(x, y, 'platform');
        }

    },

    jumpPlatform: function () {
        // console.log("You jumped on a platform");
    }

};

var GameState2 = {
    init: function () {
        this.world.setBounds(0, 0, 800, 600)
    },
    preload: function () {
        this.load.image('bird', 'Images2/pigi.png');

    },
    create: function () {
        this.textBox = this.add.text(100, 100, "this is level 2")

        this.stage.backgroundColor = "#7ec0ee";

        // this.ground = this.add.sprite(0, this.world._height - 50, 'ground');
        this.ground = this.add.tileSprite(0, this.world._height - 50, this.world.width, 50, 'ground');

        this.physics.arcade.enable(this.ground);
        this.ground.body.gravity = false;
        this.ground.body.immovable = false;

        this.bird = this.add.sprite(100, this.world.height / 2, 'bird');
        this.bird.scale.setTo(0.3);
        this.bird.anchor.setTo(.8, .5);
        this.physics.arcade.enable(this.bird);
        this.jumpBtn = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        this.input.onDown.add(this.jump, this)

        this.bird.collideWorldBounds = true;

        this.pipesGroup = this.add.group();
        this.pipesGroup.enableBody = true;
        this.pipeMaker = this.time.events.loop(2000, this.makepipe, this);


    },

    makepipe: function () {

        var pipe1, pipe2;
        pipe1 = this.pipesGroup.getFirstExists(false);
        pipe2 = this.pipesGroup.getFirstExists(false);


        if (!pipe1) {
            pipe1 = this.pipesGroup.create(900, 100, 'tree');
            pipe1.scale.setTo(1, -1);
            pipe1.anchor.y = 0.5;

            pipe2 = this.pipesGroup.create(900, 400, 'tree');

        }
        else {
            pipe1.reset(900, 200);
            pipe2.reset(900, 400);
        }

        pipe1.body.velocity.x = -200;
        pipe2.body.velocity.x = -200;
        pipe1.body.allowGravity = false;
        pipe2.body.allowGravity = false;

    },
    update: function () {

        // console.log(this.input.activePointer.clientX + " " + this.input.activePointer.clientX);

        this.pipesGroup.forEach(function (pipe) {
            if (pipe.x <= 0) {
                // pipe.kill();
                pipe.destroy();
            }
        })

        if (this.bird.angle >= -30) {
            this.bird.angle -= 1;
        }

        if (this.jumpBtn.isDown) {
            this.bird.angle += 10;
            this.bird.body.velocity.y = -500;
        }
        this.physics.arcade.collide(this.bird, this.ground, this.game_over, null, this);

        this.physics.arcade.collide(this.bird, this.pipesGroup, this.game_over, null, this);


    },
    jump: function () {
        this.bird.angle += 10;
        this.bird.body.velocity.y = -500;
    },

    game_over: function (sprite1, sprite2) {
        alert("Game over")

        this.textBox.setText(sprite1.x + ", " + sprite1.y + " Sprite2: " + sprite2.x + ", " + sprite2.y);

        game.state.start('level2');
    },
    render: function () {
        // this.game.debug.input.activePointer
        this.game.debug.spriteBounds(this.bird);
        // this.game.debug.spriteBounds(this.pipesGroup)
        this.pipesGroup.forEach(function (pipe) {
            this.game.debug.spriteBounds(pipe)
        })
    }
}

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'gamediv');

game.state.add('level1', GameState);
game.state.add('level2', GameState2);
game.state.add('MainState', MainState);
game.state.add('Bootstate', Bootstate);


// game.state.add('level1' , GameState2);
// console.log(GameState);
// game.state.start('level1');
game.state.start('level1');
