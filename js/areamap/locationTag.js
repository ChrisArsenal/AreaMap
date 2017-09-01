/**
 * @fileoverview 位置标签
 * @author 吴钦飞
 * @link https://github.com/forwardNow/AreaMap
 */
define( [ "./config" ], function ( Config ) {

    /**
     * 位置标记
     * @param opts {{ id: String, x: Number, y: Number}}
     * @constructor
     */
    function LocationTag ( opts ) {
        this.opts = opts;
        this._init();
    }

    /**
     * 初始化
     *      创建并移动
     * @private
     */
    LocationTag.prototype._init = function () {
        this._fmtOpts( this.opts );
        this.create();
        this.move()
    };

    /**
     * 创建位置标签
     *      创建位置标签的具体方式 在 AreaMap._useWhichShape() 中决定
     */
    LocationTag.prototype.create = function () {
    };

    /**
     * 移动位置标签
     *      移动的具体方式 在 AreaMap._useWhichShape() 中决定
     */
    LocationTag.prototype.move = function () {
    };

    /**
     * 格式化opts
     * @example
     *      {
     *          id: "id_1"
     *          x: 22500,
     *          y: 3000,
     *          cmd: 1
     *      }
     *      格式化为
     *      {
     *          id: "id_1",
     *          position: {
     *              x: 22500,
     *              y: 3000
     *          },
     *          text: "吴钦飞"
     *      }
     * @private
     */
    LocationTag.prototype._fmtOpts = function () {
        var
            originOpts = this.opts,
            fmtOpts = {}
        ;
        fmtOpts.id = originOpts.id;
        fmtOpts.position = {
            x: originOpts.x,
            y: originOpts.y
        };
        fmtOpts.text = Config.idToNameMapping[ originOpts.id ] || originOpts.id;
        this.opts = fmtOpts;
        this.originOpts = originOpts;
    };




    /**
     * 创建，矩形
     * @private
     */
    LocationTag.prototype.createRectangle = function () {
        var
            THREE = window.THREE,
            scene = LocationTag.prototype.AreaMap.scene,
            text = this.opts.text,

            size,
            colors,

            planeGeometry,
            planeMaterial,
            planeMesh,

            textGeometry,
            textMaterial,
            textMesh

        ;

        size = this._calcSize( this.opts.text );
        colors = this._getColor();

        planeGeometry = new THREE.PlaneGeometry( size.planeWidth, size.planeHeight );
        planeMaterial = new THREE.MeshBasicMaterial( { color: colors[ 1 ], transparent: true, opacity: 0.8 } );
        planeMesh = new THREE.Mesh( planeGeometry, planeMaterial );

        textGeometry = new THREE.TextGeometry( text, { font: Config.font, height: 0, size: Config.textSize } );
        textMaterial = new THREE.MeshBasicMaterial( { color: colors[ 0 ], transparent: true, opacity: 0.8 } );
        textMesh = new THREE.Mesh( textGeometry, textMaterial );

        this.planeMesh = planeMesh;
        this.textMesh = textMesh;

        scene.add( planeMesh );
        scene.add( textMesh );
    };

    /**
     * 创建，定位锚
     * @private
     */
    LocationTag.prototype.createLocator = function () {
        var
            scene = LocationTag.prototype.AreaMap.scene,
            text = this.opts.text,

            colors,

            circleGeometry,
            circleMaterial,
            circleMesh,
            /*
             littleCircleGeometry,
             littleCircleMaterial,
             littleCircleMesh,
             */
            triangleShape,
            triangleGeometry,
            triangleMaterial,
            triangleMesh,

            textGeometry,
            textMaterial,
            textMesh

        ;

        colors = this._getColor();

        circleGeometry = new THREE.CircleGeometry( Config.textSize , 32 );
        circleMaterial = new THREE.MeshBasicMaterial( { color: colors[ 1 ]/*, transparent: true, opacity: 0.9 */} );
        circleMesh = new THREE.Mesh( circleGeometry, circleMaterial );
        /*

         littleCircleGeometry = new THREE.CircleGeometry( Config.textSize / 3 , 32 );
         littleCircleMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff/!*, transparent: true, opacity: 0.9*!/  } );
         littleCircleMesh = new THREE.Mesh( littleCircleGeometry, littleCircleMaterial );
         */


        triangleShape = new THREE.Shape();
        triangleShape.moveTo( 0, 0 );
        triangleShape.lineTo( 2 * Config.textSize, 0 );
        triangleShape.lineTo( Config.textSize, -3 * Config.textSize);
        triangleShape.lineTo( 0, 0);
        triangleGeometry = new THREE.ShapeGeometry( triangleShape );
        triangleMaterial = new THREE.MeshBasicMaterial( { color: colors[ 1 ], transparent: true, opacity: 0.9 } );
        triangleMesh = new THREE.Mesh( triangleGeometry, triangleMaterial ) ;

        textGeometry = new THREE.TextGeometry( text, { font: Config.font, height: 0, size: Config.textSize } );
        textMaterial = new THREE.MeshBasicMaterial( { color: colors[ 1 ], transparent: true, opacity: 0.8 } );
        textMesh = new THREE.Mesh( textGeometry, textMaterial );

        this.textMesh = textMesh;
        this.triangleMesh = triangleMesh;
        this.circleMesh = circleMesh;
        // this.littleCircleMesh = littleCircleMesh;

        scene.add( triangleMesh );
        scene.add( textMesh );
        scene.add( circleMesh );
        // scene.add( littleCircleMesh );
    };

    /**
     * 获取颜色
     * @return {[Number, Number]} [字体的颜色, 图像的颜色]
     * @private
     */
    LocationTag.prototype._getColor = function () {
        var
            colorList = Config.colorList
        ;

        if ( typeof colorList.currentIndex !== "number" ) {
            colorList.currentIndex = 0;
        }

        colorList.currentIndex++;

        if ( colorList.currentIndex >= colorList.length ) {
            colorList.currentIndex = 0;
        }

        return colorList[ colorList.currentIndex ];
    };




    /**
     * 移动
     * @param pos {({x: Number, y: Number}|{textPositionX: Number, textPositionY: Number, planePositionX: Number, planePositionY: Number})?}
     */
    LocationTag.prototype.moveRectangle = function ( pos ) {
        var
            planePosition,
            textPosition
        ;
        pos = pos || this.opts.position;

        if ( ! pos.hasOwnProperty( "textPositionX" ) ) {
            pos = this._calcRectanglePos( pos );
        }

        textPosition = this.textMesh.position;
        textPosition.x = pos.textPositionX;
        textPosition.y = pos.textPositionY;
        textPosition.z = 0;

        planePosition = this.planeMesh.position;
        planePosition.x = pos.planePositionX;
        planePosition.y = pos.planePositionY;
        planePosition.z = 0;

        LocationTag.prototype.AreaMap.update();
    };
    /**
     * 移动
     * @param pos {({x: Number, y: Number}|{textPositionX: Number, textPositionY: Number, trianglePositionX: Number, trianglePositionY: Number, circlePositionX: Number, circlePositionY: Number})?}
     */
    LocationTag.prototype.moveLocator = function ( pos ) {
        var
            trianglePosition,
            circlePosition,
            // littleCirclePosition,
            textPosition
        ;
        pos = pos || this.opts.position;

        if ( ! pos.hasOwnProperty( "textPositionX" ) ) {
            pos = this._calcLocatorPos( pos );
        }

        textPosition = this.textMesh.position;
        textPosition.x = pos.textPositionX;
        textPosition.y = pos.textPositionY;
        textPosition.z = 0;

        trianglePosition = this.triangleMesh.position;
        trianglePosition.x = pos.trianglePositionX;
        trianglePosition.y = pos.trianglePositionY;
        trianglePosition.z = 0;

        circlePosition = this.circleMesh.position;
        circlePosition.x = pos.circlePositionX;
        circlePosition.y = pos.circlePositionY;
        circlePosition.z = 0;
        /*

         littleCirclePosition = this.littleCircleMesh.position;
         littleCirclePosition.x = pos.circlePositionX;
         littleCirclePosition.y = pos.circlePositionY;
         littleCirclePosition.z = 0;
         */

        LocationTag.prototype.AreaMap.update();
    };

    /**
     * 根据文本计算元素的尺寸
     * @param text {String?}
     * @return {{planeWidth: number, planeHeight: number, textWidth: number, textHeight: number}}
     * @private
     */
    LocationTag.prototype._calcSize = function ( text ) {
        var
            textLength,

            textWidth,
            textHeight,
            planeWidth,
            planeHeight
        ;

        text = text || this.opts.text;

        if ( $.isNumeric( text ) ) {
            textLength = ( text + "" ).length / 1.6;
        } else {
            textLength = text.length;
        }

        textWidth = textLength * Config.textSize;
        textHeight = Config.textSize;

        planeWidth = textWidth * 1.6;
        planeHeight = textHeight * 1.6;


        return {
            planeWidth: planeWidth,
            planeHeight: planeHeight,

            textWidth: textWidth,
            textHeight: textHeight
        };
    };

    /**
     * 根据(x,y)坐标计算实际的坐标
     * @param pos {({x: Number, y: Number})?}
     * @return {{planePositionX: number, planePositionY: number, textPositionX: number, textPositionY: number}}
     * @private
     */
    LocationTag.prototype._calcRectanglePos = function ( pos ) {
        var
            xRate = Config.xRate,
            yRate = Config.yRate,

            size = this._calcSize(),

            textWidth = size.textWidth,
            textHeight = size.textHeight,

            planePositionX,
            planePositionY,
            textPositionX,
            textPositionY
        ;


        planePositionX = pos.x * xRate;
        planePositionY = pos.y * yRate;

        textPositionX = pos.x * xRate - textWidth / 2 * 1.4;
        textPositionY = pos.y * yRate - textHeight / 2;

        return {
            planePositionX: planePositionX,
            planePositionY: planePositionY,

            textPositionX: textPositionX,
            textPositionY: textPositionY
        };
    };

    /**
     * 根据(x,y)坐标计算实际的坐标
     * @param pos {({x: Number, y: Number})?}
     * @return {{textPositionX: Number, textPositionY: Number, trianglePositionX: Number, trianglePositionY: Number, circlePositionX: Number, circlePositionY: Number}}
     * @private
     */
    LocationTag.prototype._calcLocatorPos = function ( pos ) {
        var
            xRate = Config.xRate,
            yRate = Config.yRate,

            size = this._calcSize(),

            textWidth = size.textWidth,
            textHeight = size.textHeight,

            trianglePositionX,
            trianglePositionY,
            circlePositionX,
            circlePositionY,
            textPositionX,
            textPositionY
        ;


        circlePositionX = pos.x * xRate;
        circlePositionY = pos.y * yRate + Config.textSize * 3.4;

        trianglePositionX = circlePositionX - Config.textSize;
        trianglePositionY = circlePositionY;

        textPositionX = pos.x * xRate - textWidth / 2 * 1.3;
        textPositionY = pos.y * yRate - textHeight / 2;

        return {
            trianglePositionX: trianglePositionX,
            trianglePositionY: trianglePositionY,

            circlePositionX: circlePositionX,
            circlePositionY: circlePositionY,

            textPositionX: textPositionX,
            textPositionY: textPositionY
        };
    };

    /**
     * 销毁
     */
    LocationTag.prototype.destroy = function () {
        var
            meshNameList = [ "textMesh", "planeMesh", "circleMesh", "triangleMesh" ],
            mesh, meshName, i, len
        ;
        // 从缓存中删除
        LocationTag.prototype.AreaMap.locationTagSet[ this.opts.id ] = undefined;

        // 在场景中删除对应的物体
        for ( i = 0, len = meshNameList.length; i < len; i++ ) {
            meshName = meshNameList[ i ];
            mesh = this[ meshName ];
            if ( ! mesh ) {
                continue;
            }
            LocationTag.prototype.AreaMap.scene.remove( mesh );
            this[ meshName ] = null;
        }

    };

    return LocationTag;
} );