(function(global, $){
	// Default Option define.
	var defaultOption = {
		"nColumPadding" : 10,
		"nMarginHeight" : 0,
		"nMarginWidth" : 0,
		"nAdjustAngle" : 45
	};

	var nCIdx = 0;
	var bIsMobile = navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i);
	var bIs3DUse = navigator.userAgent.match(/Android|iPhone|iPad|iPod|Chrome/i);
	var sCssPrefix = (function(){
			var sCssPrefix = "";
			if(typeof document.body.style.webkitTransition !== "undefined") {
				sCssPrefix = "webkit";
			} else if(typeof document.body.style.transition !== "undefined") {
			} else if(typeof document.body.style.MozTransition !== "undefined") {
				sCssPrefix = "Moz";
			} else if(typeof document.body.style.OTransition !== "undefined") {
				sCssPrefix = "O";
			} else if(typeof document.body.style.msTransition !== 'undefined'){
				sCssPrefix = "ms";
			}
			return sCssPrefix;
	})();
	


	/**
	 * module construtor function.
	 * 
	 * @param {Element} el
	 * @param {Object} option
	 */
	var dcolumns = function(el, option){
		nCIdx++;
		this.option = $.extend(defaultOption, option);
		this._initVar();
		this._getElement(el);
	};


	/**
	 * Internal variable declarations.
	 */
	dcolumns.prototype._initVar = function(){
		this._oTouch = null;
		this._oTransition = null;;
		this._nTotalPage = 0;
		this._nCurrentPage = 1;
		this._fnTransitionEnd = null;
		this._bVScroll = false;
		this._nBaseWidth = 0; 
		this._sId = "DCOL_"+ nCIdx;
		
		this._nScrollStart = 0;
		this._nColumnWidth = 0;
		this._sAgent = navigator.userAgent.toLowerCase();
		
	};

	/**
	 * Component load function.
	 */
	dcolumns.prototype.load = function(){
		this.activate();
		this.refresh();
	};

	/**
	 * Component Activate
	 */ 
	dcolumns.prototype.activate = function(){
		this._bindEvent();	
	};

	/**
	 * Component Deactivate
	 */
	dcolumns.prototype.deactivate = function(){
		this._unbindEvent();	
	};


	/**
	 * Creating a use Element reference
	 * @param {Element} el
	 */
	dcolumns.prototype._getElement = function(el){
		// wrapper-element Make.
		$("<div id='"+this._sId+"_DCOL_BASE'><div id='"+this._sId+"_DCOL_WRAPPER'></div></div>").insertAfter(el);

		this._welBase = $("#"+this._sId+"_DCOL_BASE");
		this._welContaierWrapper = $("#"+this._sId+"_DCOL_WRAPPER");
		this._welContaierWrapper.append(el);
		this._welContaierWrapper.append($("<div id='"+this._sId+"_DCOL_END_POS'></div>"));
		this._welContaier = $(el);
		this._nBaseWidth = this._welBase.width();
				
	};

	/*
	 * bind component events.
	 */ 
	 dcolumns.prototype._bindEvent = function(){
	 	var _this = this;
		var nAdjustAngle = this.option.nAdjustAngle;

		
		var sStartEventName = ((bIsMobile) ? "touchstart" : "mousedown") + ".dcol";
		var sMoveEventName = ((bIsMobile) ? "touchmove" : "mousemove")  + ".dcol";
		var sEndEventName = ((bIsMobile) ? "touchend" : "mouseup") + ".dcol";
		var bIsStartMove = false;

		this._welBase.on(sStartEventName, function(event){
			_this._bVScroll = false;
			bIsStartMove = true;
			
			_this._nStartPosX = event.pageX;
			_this._nStartPosY = event.pageY;
			event.preventDefault();
		}).on(sMoveEventName, function(event){
			if(!bIsStartMove){
				return;
			}
			var nEndPosX = event.pageX;
			var nEndPosY = event.pageY;

			var nAngle = _this._getAngle(_this._nStartPosX, _this._nStartPosY, nEndPosX, nEndPosY);
			
			if(!_this._bVScroll && nAngle < nAdjustAngle){
				event.preventDefault();
				_this._movePanel((nEndPosX - _this._nStartPosX));
			} else if(nAngle >= nAdjustAngle){
				_this._bVScroll = true;
			}
		}).on(sEndEventName, function(event){
			if(!bIsStartMove){
				return;
			}
			var nEndPosX = event.pageX;
			var nEndPosY = event.pageY;

			var nAngle = _this._getAngle(_this._nStartPosX, _this._nStartPosY, nEndPosX, nEndPosY);
				
			if(!_this._bVScroll && nAngle < nAdjustAngle){
				event.preventDefault();
				_this._moveAnimation((nEndPosX - _this._nStartPosX));
			}

			bIsStartMove = false;
			_this._bVScroll = false;
		});

	 	$(document).on("orientationchange.dcol resize.dcol", function(){
	 		setTimeout(function(){
	 			_this.refresh();
	 		}, 100);

	 	});
	 };

	 /*
	 * unbind component events.
	 */ 
	 dcolumns.prototype._unbindEvent = function(){
		this._welBase.off(".dcol");
	 	$(document).off(".dcol");
	 };

	/**
	 * To update the Layout to fit the screen.
	 */
	dcolumns.prototype._setLayout = function(){
		var fnScreenSize = this.option.fnScreenSize;
		var htScreenInfo = (fnScreenSize) ? fnScreenSize() : this._getScreenInfo(this.option.nMarginHeight);		
		var nHeight = htScreenInfo.nHeight;
		
		this._nBaseWidth = this._welBase.width();		

		this._welContaier.css({height: nHeight + "px"});
		this._welContaierWrapper.css({width:"100%", height: nHeight + "px", position:"absolute"});
		//this._welContaierWrapper.css({width:"100%", height: nHeight + "px", "overflow":"auto"});
		this._welBase.css({height: nHeight + "px", position:"relative", overflow:"hidden", "paddingTop": "10px"});
		
		this._applyColumns(htScreenInfo.nColumn);
		this._nScrollHeight = nHeight;
	};


	/**
	 * Style Class generation for Columns apply.
	 * @param {Number} nColumn
	 * @param {Number} nColumPadding
	 * @param {Number} nColumnWidth
	 */
	dcolumns.prototype._createStyle = function(nColumn, nColumPadding, nColumnWidth){
		var elStyleTag = $("DCOL_PAGING_STYLE");
		if(elStyleTag) {
			jindo.$Element(elStyleTag).leave();
		}
		
		elStyleTag = document.createElement('style');
		var elHTML = document.getElementsByTagName('head')[0];
		elStyleTag.type = "text/css";
		elStyleTag.id = "DCOL_PAGING_STYLE";
		elHTML.appendChild(elStyleTag);

		elStyleTag.innerText = '._ncc_paging_col'+nColumn+' {box-sizing:border-box;-webkit-box-sizing:border-box;'
		+ '-webkit-column-count:'+nColumn+';'
		+ '-webkit-column-gap:'+nColumPadding+'px;'
		+ '-webkit-column-width:'+nColumnWidth+'px;';
		
		return "_ncc_paging_col" + nColumn;
		
	};
	/**
	 * Columns apply.
	 * @param {Number} nColumn
	 */
	dcolumns.prototype._applyColumns = function(nColumn){
		var nColumnWidth, sCreateStyleName;
		var nColumPadding = this.option.nColumPadding;
		nColumnWidth = (this._nBaseWidth / nColumn) - (nColumPadding * (nColumn * 2));



		// In the case of iOS, processed in the CSS Style. 
		if(this._sAgent.indexOf("ios") > -1 || this._sAgent.indexOf("iphone") > -1 || this._sAgent.indexOf("ipad") > -1){
			sCreateStyleName = this._createStyle(nColumn, nColumPadding, nColumnWidth);
			this._welContaier[0].className = sCreateStyleName;
		} else {
			this._welContaier.css({
				"-moz-column-count" : nColumn,
				"-moz-column-gap" : nColumPadding + "px",
				"-moz-column-width" : nColumnWidth + "px",
				"-webkit-column-count" : nColumn,
				"-webkit-column-gap" : nColumPadding + "px",
				"-webkit-column-width" : nColumnWidth + "px"
			});
		}
		
		this._nColumnWidth = nColumnWidth;
		this._nColumn = nColumn;
	};

	/**
	 * Turning animation processing
	 * @param {Number} nPos
	 */
	dcolumns.prototype._moveAnimation = function(nPos){
		var bForward = true;
		var nVactor = (nPos < 0) ? nPos * -1 : nPos;
		var nLeft = 0, bRestore;
		var nCurrentPos = this._getCalcCurrentPos();
		if(nPos > 0){
			bForward = false;		
		}

		
		if(nVactor > (window.innerWidth * 0.1)){
			if(bForward){				
				if(this._nCurrentPage != this._nTotalPage){			
					this._nCurrentPage++;				
				} else {
					bRestore = true;
				}
			}
			if(!bForward){
				if(this._nCurrentPage != 1){
					this._nCurrentPage--;
				} else {
					bRestore = true;
				}				
			}			
		}
		nLeftPos = this._getCalcCurrentPos();
	
		var fnStyle = null;
		if(bIs3DUse){

			this._welContaierWrapper.css({
				"-webkit-transition" : "300ms",
				"-webkit-transform" : "translate3d("+nLeftPos+"px, 0px, 0px)"
			}).on("transitionend", function(){
				$(this).css({
					"-webkit-transition" : ""
				}).off("transitionend");
			});
		} else {			

			this._welContaierWrapper.animate({left : nLeftPos + "px"}, 300, function(){

			});
		}
	};

	/**
	 * Split page number of calculation 
	 */
	dcolumns.prototype._calcPages = function(){		
		var nTotalWidth;
		var nPadding = this.option.nColumPadding;
		var elLastPos = this._welContaier.find("." + this._sId+"_DCOL_END_POS");
		var nLastPos = elLastPos.offsetLeft;
		
		// Columns 로 변환후 늘어난 Width 를 화면 사이즈로 나누어 계산하여 전체 페이지 계산.	
		nLastPos = this._welContaier[0].scrollWidth;
		this._nTotalPage = Math.floor(nLastPos / (this._nBaseWidth + nPadding));
		this._nTotalPage += ((nLastPos % (this._nBaseWidth + nPadding)) >= $(elLastPos).width()) ? 1 : 0;
	};

	

	/**
	 * Currently returns the value of the LEFT position 
	 */
	dcolumns.prototype._getCalcCurrentPos = function(){
		var nPadding = this.option.nColumPadding;
		return (this._nCurrentPage - 1) * (this._nBaseWidth + nPadding) * -1;
	},

	/*
	 * Layout update 
	 */ 
	 dcolumns.prototype.refresh = function(){
	 	var _this = this;
		//this._getElement(this._welBase.$value());		
		this._setLayout();
		//setTimeout(function(){
			this._calcPages();
			this.movePage(_this._nCurrentPage);			
			//this.fireEvent("onRefresh", {nPage : this._nCurrentPage, nTotalPage : this._nTotalPage});
		//},500);
	 };	 

	 /**
	 * Move page
	 * @param {Number} nPage
	 */
	dcolumns.prototype.movePage  = function(nPage){		
		if(nPage > this._nTotalPage){
			nPage = this._nTotalPage;
		}		
		this._nCurrentPage = nPage;
		this._movePanel(0);
		//this.fireEvent("onChangePage", {nPage : this._nCurrentPage, nTotalPage : this._nTotalPage});
	};

	/**
	 * Move panel 
	 * @param {Number} nPos
	 */
	dcolumns.prototype._movePanel = function(nPos){
		var nCurrentPos = this._getCalcCurrentPos();
		
		var htCss = {};
		
		if(this._sAgent.indexOf("ios") > -1 || 
			this._sAgent.indexOf("iphone") > -1 || 
			this._sAgent.indexOf("ipad") > -1 || 
			this._sAgent.indexOf("android") > -1 ||
			this._sAgent.indexOf("chrome") > -1){
			htCss[sCssPrefix+'Transform'] =  "translate3d(" + (nCurrentPos+nPos) +"px, 0px, 0px)";
			this._welContaierWrapper.css(htCss);
		} else {
			this._welContaierWrapper.css("left", (nCurrentPos+nPos) + "px");
		}        
		this._welContaierWrapper.css({whyNotToUseANonExistingProperty : (nCurrentPos+nPos)});
		this._welContaierWrapper.data("pos", (nCurrentPos+nPos));
	};

	/**
	 * 전체 Index 수 반환.
	 */
	dcolumns.prototype.getTotalPage = function(){
		return this._nTotalPage;
	};

	dcolumns.prototype.moveByPage = function(nPage){
		this.movePage(nPage);
	};
	
	dcolumns.prototype.getCurrentIndex = function(){
		return ((this._nCurrentPage - 1) > 0) ? this._nCurrentPage - 1 : 0;
	};

	dcolumns.prototype.resizeWindow = function(){
		this.refresh();
	};

	dcolumns.prototype.getCurrentLeftPos = function(){		
		return this._getCalcCurrentPos();
	};


	/**
	 * 화면 크기에따른 Column 갯수 및 높이값 정보.
	 */
	dcolumns.prototype._getScreenInfo = function(nMarginHeight){
		var nScreenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
		var nScreenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
		var nColumn = 1, nHeight = (window.innerHeight - nMarginHeight);
		
		
		if(nScreenHeight > nScreenWidth){
			if(nScreenWidth >= 768){
				nColumn = 2;
			}
		} else {
			if(nScreenWidth >= 1024){
				nColumn = 3;
			} else if(nScreenWidth >= 598){
				nColumn = 2;
			}
		}
		return {nHeight : nHeight, nColumn : nColumn};
		
	};



	/**
	 * Calculate the angle between the two touch points.
	 */
	dcolumns.prototype._getAngle = function(nSX, nSY, nEX, nEY){
		var deltaX =  nSX - nEX,
        deltaY = nSY - nEY;
		
		var nAngle =  Math.atan2(deltaY, deltaX) * (180/Math.PI);
		nAngle = Math.abs(nAngle);
		if(nAngle > 90){
			nAngle = 180 - nAngle;
		}
		
		return nAngle;
	};


	global.Dcolumns = dcolumns;
})(window, jQuery);