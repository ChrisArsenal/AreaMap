/**
 * @fileoverview 区域地图，用于显示位置坐标
 *
 *      AreaMap.init()：初始化
 *      AreaMap.diplay()：用three.js显示解析后的DXF文件
 *      AreaMap.setLocationTag( { id: String, x: Number, y: Number, cmd: Number} )：标志坐标
 *
 *      当人离开（cmd=0）或第一次出现（cmd=1）时，会请求 id到name 的映射表
 *
 * -------------------------- 就是显示人的位置的一个东西 -------------------------
 *
 *   1. 使用Three.js显示dxf文件（cad图）的内容
 *
 *       1）请求 dxf文件（cad图），并解析成JS对象 jsonData
 *       2）Three.js 将 jsonData 渲染成 2D图
 *
 *   2. 将服务器发送过来的人的坐标(posData)显示在 2D图 上
 *
 *       1）posData 的格式
 *
 *           {
 *               // 人的ID
 *               id: Number,
 *               // 坐标类型：0 - 人离开了；1 - 人第一次出现；2 - 人移动了。
 *               cmd: Number,
 *               // 坐标
 *               x: Number,
 *               y: Number,
 *           }
 *
 *       2）根据 posData ，在 2D图 上显示人的位置标签
 *
 *   3. 其他
 *
 *       1）ID到人名的映射表
 *
 *           人离开以及第一次出现时，都会去请求
 *
 *       2）待续
 *       
 * @author 吴钦飞
 */
define( [ "jquery", "./locationTag", "./config", "threedxf" ], function ( $, LocationTag, Config ) {
    "use strict";
    var
        AreaMap
    ;
    /**
     * 场景地图
     */
    AreaMap = {
        // 在目标元素中显示
        $target: null,
        // 实例
        threeDxfInstance: null,
        // new THREE.Scene() 实例
        scene: null,
        // 格式化后参数
        opts: null,
        // 原始参数
        originOpts: null
    };

    /**
     * 初始化
     * @param initedCallback {Function?}
     * @return {AreaMap}
     */
    AreaMap.init = function ( initedCallback ) {

        // 与 LocationTag 产生关联
        LocationTag.prototype.AreaMap = AreaMap;

        this.Config = Config;

        this._render();

        this._useWhichShape();

        Config.init( function() {
            initedCallback && initedCallback();
            AreaMap.display();
        } );


        return this;
    };

    /**
     * 赋值
     * @private
     */
    AreaMap._render = function () {
        this.$target = $( "#areaMapView" );
    };

    /**
     * 决定使用哪个形状
     */
    AreaMap._useWhichShape = function () {
        //
        switch ( Config.anchorShape ) {
            case "rectangle": {
                LocationTag.prototype.create = LocationTag.prototype.createRectangle;
                LocationTag.prototype.move = LocationTag.prototype.moveRectangle;
                break;
            }
            case "locator": {
                LocationTag.prototype.create = LocationTag.prototype.createLocator;
                LocationTag.prototype.move = LocationTag.prototype.moveLocator;
                break;
            }
        }
    };

    /**
     * 展示
     */
    AreaMap.display = function () {
        var
            data = Config.fmtDxfData,
            $target = this.$target,
            width = $target.width(),
            height = $target.height(),
            font = Config.font,
            threeDxfInstance
        ;
        threeDxfInstance = new window.ThreeDxf.Viewer(data, $target.get( 0 ), width, height, font);

        this.threeDxfInstance = threeDxfInstance;
        this.scene = threeDxfInstance.threeScene;
    };

    /**
     * 刷新
     */
    AreaMap.update = function () {
        this.threeDxfInstance.render();
    };

    /**
     * 移动
     * @param data {{ id: String, x: Number, y: Number, cmd: Number}}
     */
    AreaMap.setLocationTag = function ( data ) {
        var locationTag = this.getLocationTag( data );
        locationTag.move( data );
    };


    /**
     * 保存所有的实例，以id为key
     */
    AreaMap.locationTagSet = {

    };

    /**
     * 获取一个 LocationTag 实例
     *      如果已经创建，则从集合中获取
     *      如果未创建，则创建
     * @param opts {{ id: String, x: Number, y: Number, cmd: Number}}
     * @return {LocationTag}
     */
    AreaMap.getLocationTag = function ( opts ) {
        var
            id = opts.id,
            locationTag,
            cmd = opts.cmd
        ;

        // 从集合中找
        locationTag = this.locationTagSet[ id ];

        // 根据 cmd 进行相应操作， 当 cmd = 0 时，销毁该元素
        if ( cmd === 0 && locationTag ) {
            locationTag.destroy();
            locationTag = null;
        }

        // 当 cmd = 0 || cmd = 1 时（有人离开或出现时），异步Ajax请求映射表
        if ( cmd === 0 || cmd === 1 ) {
            Config.getIdToNameMappingData( true );
        }

        if ( locationTag ) {
            return locationTag;
        }

        return this.createLocationTag( opts );

    };

    /**
     * 创建实例
     * @param opts {{ id: String, x: Number, y: Number}}
     * @return {LocationTag}
     */
    AreaMap.createLocationTag = function ( opts ) {
        var
            locationTag = new LocationTag( opts )
        ;
        // 存入集合
        AreaMap.locationTagSet[ opts.id ] = locationTag;
        return locationTag;
    };

    return AreaMap;
} );