/**
 * @fileoverview 配置
 *
 * @author 吴钦飞
 */
define( [ "jquery", "./alert" ], function ( $, Alert ) {
    "use strict";
    var
        Config
    ;

    Config = {

        // three.js 需要的中文字体（微软雅黑粗体，27M）是否获取完毕
        _isChineseFontReady: false,
        // dxf文件（cad图，10M）是否获取完毕
        _isDxfFileReady: false,
        // 字体和CAD图是否准备就绪
        _isPrepared: false,

        // 标志坐标的形状："rectangle", "locator"
        anchorShape: "locator",

        $container: "#areaMap",
        $progress: "#areaMapProgress",

        // dxf文件的URL
        dxfFileUrl: null,
        // window.DxfParser 的实例
        dxfParser: null,
        // 通过URL获取的 dxf文件 的原始数据（String）
        originDxfData: null,
        // 通过 DxfParser 解析好的JS对象
        fmtDxfData: null,

        // 字体文件
        fontUrl: null,
        // 字体文件对象
        font: null,

        // id到name的映射
        idToNameMappingUrl: null,
        idToNameMapping: null,

        // web socket url
        websocketUrl: "",

        // 字体大小
        textSize: 400,
        // 实际的X坐标 与 请求的X坐标 比
        xRate: 10,
        // 实际的Y坐标 与 请求的Y坐标 比
        yRate: 10,

        // 颜色列表
        colorList: [
            [ 0xffffff, 0x7eb8f2 ],
            [ 0xffffff, 0x98689a ],
            [ 0xffffff, 0x0099cb ],
            [ 0xffffff, 0xff6764 ],
            [ 0xffffff, 0xff9a66 ],
            [ 0xffffff, 0xcd9967 ],
            [ 0xffffff, 0x666666 ],
            [ 0xffffff, 0x99ce66 ],
            [ 0xffffff, 0xcc3431 ],
            [ 0xffffff, 0x013565 ],
            [ 0xffffff, 0x993331 ],
            [ 0xffffff, 0x653567 ],
            [ 0xffffff, 0x0067cc ],
            [ 0xffffff, 0xcc032f ],
            [ 0xffffff, 0x346633 ],
            [ 0xffffff, 0x993331 ],
            [ 0xffffff, 0x013300 ],
            [ 0xffffff, 0x323499 ],
            [ 0xffffff, 0x003499 ],
            [ 0xffffff, 0x029b63 ],
            [ 0xffffff, 0xfe9b00 ]
        ]
    };

    /**
     * 初始化
     * @param callback {Function}
     */
    Config.init = function ( callback ) {

        this._render();

        // this._getDxfData();
        // this._getFontData();

        this._prepareData( callback );

        this.getIdToNameMappingData();

        return this;
    };
    /**
     * 赋值
     * @private
     */
    Config._render = function () {
        this.$container = $( this.$container );
        this.$progress = $( this.$progress );

        this.dxfFileUrl = this.$container.data( "dxf-file-url" );
        this.idToNameMappingUrl = this.$container.data( "id-to-name-mapping-url" );
        this.websocketUrl = this.$container.data( "websocket-url" );
        this.fontUrl = this.$container.data( "font-url" );

        this.dxfParser = new DxfParser();
    };

    /**
     * 准备数据（字体文件和DXF文件）
     * @param callback {Function?}
     * @private
     */
    Config._prepareData = function ( callback ) {
        var
            _this = this,
            $progress = this.$progress,
            $progressBar = $( "#areaMapProgressBar" ),
            $areaMapProgressNum = $( "#areaMapProgressNum" ),
            $areaMapProgressTxt = $( "#areaMapProgressTxt" ),
            timerId,
            count = 0
        ;

        console.info( "准备数据..." );

        // 3秒走完进度条
        timerId = window.setInterval( function () {
            if ( count >= 100 ) {
                window.clearInterval( timerId );
                window.setTimeout( function () {
                    $progress.fadeOut( 600 );
                }, 1500 );
                count = 99;
            }
            $progressBar.css( "width", ++count + "%" );
            $areaMapProgressNum.text( count );
        }, 3 * 1000 / 100 );

        this._getDxfData( function () {
            console.info( "DXF文件请求完毕！" );
            $areaMapProgressTxt.text( "DXF文件请求完毕" );
            if ( count + 40 >= 100 ) {
                count += 40;
            } else {
                count = 99;
            }
            refresh();
        } );
        this._getFontData( function () {
            console.info( "字体文件请求完毕！" );
            $areaMapProgressTxt.text( "字体文件请求完毕" );
            if ( count + 40 >= 100 ) {
                count += 40;
            } else {
                count = 99;
            }
            refresh();
        } );

        function refresh() {
            if ( _this._isDxfFileReady === true && _this._isChineseFontReady === true ) {
                console.info( "数据准备完毕！" );
                $areaMapProgressTxt.text( "数据准备完毕" );
                _this._isPrepared = true;
                callback();
            }
        }

    };

    /**
     * 获取 dxf文件，并解析
     * @private
     * @param callback {Function?}
     */
    Config._getDxfData = function ( callback ) {
        var _this = this;

        if (  Config._getDxfData.isPending === true ) {
            return;
        }
        Config._getDxfData.isPending = true;
        $.ajax( {
            async: true,
            url: this.dxfFileUrl,
            method: "GET",
            dataType: "text"
        } ).done( function ( responseData ) {
            _this.originDxfData = responseData;
            _this._parseDxf();
            _this._isDxfFileReady = true;
            callback && callback();
        } ).fail( function () {
            console.error( "获取 dxf文件 失败。" );
            Alert.show( "获取 dxf文件 失败。" );
        } );
    };
    /**
     * 获取字体
     * @param callback {Function?}
     * @private
     */
    Config._getFontData = function ( callback ) {
        var _this = this;
        if (  Config._getFontData.isPending === true ) {
            return;
        }
        Config._getFontData.isPending = true;
        $.ajax( {
            async: true,
            url: this.fontUrl,
            method: "GET",
            dataType: "json"
        } ).done( function ( responseData ) {
            _this.font = ( new window.THREE.FontLoader() ).parse( responseData );
            _this._isChineseFontReady = true;
            callback && callback();
        } ).fail( function () {
            console.error( "获取 字体文件 失败。" );
            Alert.show( "获取 字体文件 失败。" );
        } );
    };
    Config._parseDxf = function () {
        this.fmtDxfData = this.dxfParser.parseSync( this.originDxfData );
    };

    /**
     * 获取 id到名称的映射
     */
    Config.getIdToNameMappingData = function () {
        var
            _this = this
        ;
        $.ajax( {
            async: true,
            url: this.idToNameMappingUrl,
            method: "GET",
            cache: false,
            dataType: "json"
        } ).done( function ( responseData ) {
            if ( responseData && responseData.success === true ) {
                _this.idToNameMapping = responseData.data;
            }
            else {
                throw "获取 ID到名称的映射表 失败！";
            }
        } ).fail( function () {
            console.error( "获取 ID到名称的映射表 失败！" );
            Alert.show( "获取 ID到名称的映射表 失败！" );
        } );
    };

    return Config;
} );