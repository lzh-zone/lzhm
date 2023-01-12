//  ========== 
//  = 列表数据获取js = 
//  ========== 
function dom(id) {
	return document.getElementById(id);
};
// 判断是否是移动设备
var isMobile = {
	Android: function() {
		return navigator.userAgent.match(/Android/i) ? true : false;
	},
	BlackBerry: function() {
		return navigator.userAgent.match(/BlackBerry/i) ? true : false;
	},
	iOS: function() {
		return navigator.userAgent.match(/iPhone|iPad|iPod/i) ? true : false;
	},
	Windows: function() {
		return navigator.userAgent.match(/IEMobile/i) ? true : false;
	},
	any: function() {
		return(isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Windows());
	}
};
//全部变量
var isMobile = isMobile.any(); // 判断是否是移动设备
var search = false; //是否已经搜索
var mainList = ""; //滚动条
var searchList = ""; //搜索列表滚动条
var boxSongList = "";//box详情歌单表
var returnIde = false;
var fineList = "";
var hostList = "";
var typeList = "";
var listNow = "";
var playlist = "";//按钮标记位全局变量
var stopTag = "<span class='list-icon icon-play icon-stops' data-function='stop' title='暂停'></span>";
var playTag = "<span class='list-icon icon-play' data-function='play' title='播放'></span>";
var sessionSongs = "";
// 列表中的菜单点击
$(".music-list").on("click", ".icon-play,.icon-download,.icon-share", function() {

	switch($(this).data("function")) {
		case "play": // 播放
			//如果当前地址为空，或者点击的歌曲与当前不一样或者处于搜索后第一次点击播放，那么选择当前点击的歌曲播放
			var flag = krAudio.Currentplay == $(this).parents(".list-item").index() ? false : true;
			if(isEmpty(krAudio.audioDom.src) || flag || search) {
				krAudio.Currentplay = $(this).parents(".list-item").index(); //当前播放的音乐序号
				listMenuStyleChange(krAudio.Currentplay); //列表菜单的播放暂停按钮的变换
				krAudio.seturl();
				krAudio.play();
			} else palystop(); //否则，默认执行播放和暂停

			break;
		case "stop":
			palystop(); //默认执行播放和暂停
			break;
		case "download": // 下载
			var url = $(this).parents(".list-item").data("url");
			var title = $(this).parents(".list-item").find(".music-name-cult").text();
			thisDownload(url, title);
			break;
		case "share": // 分享
			loading("敬请期待...", 5);
			break;
	}
	return true;
});

//如果是移动端，那么滚动条操作对象就是不变的
if(isMobile) {
	mainList = $("#main-list");
	searchList = $("#play-main-list");
	fineList = $("#fineList");
	hostList = $("#hostList");
	boxSongList = $("#boxSongList");
	/* 隐藏歌单列表  STAR*/
	$("#fineList").show();
	$("#hostList").hide();//热门
	$("#typeList").hide();//分类
	$("#boxSongList").fadeOut();//详情歌单
	$(".serchsongs").hide();
	/* END */
} else {
	// 滚动条初始化(只在非移动端启用滚动条控件)
	$("#main-list").mCustomScrollbar({
		theme: "minimal",
		advanced: {
			updateOnContentResize: true // 数据更新后自动刷新滚动条
		}
	});

	mainList = $("#main-list .mCSB_container");
}

//初始化追加列表小菜单
function appendlistMenu() {
	$(".list-item").each(function(index, el) {
		var target = $(el).find(".music-name");
		var html = '<span class="music-name-cult">' +
			target.html() +
			'</span>' +
			'<div class="list-menu">' +
			'<span class="list-icon icon-play" data-function="play" title="播放"></span>' +
			'<span class="list-icon icon-download" data-function="download" title="下载"></span>' +
			'<span class="list-icon icon-share" data-function="share" title="分享"></span>' +
			'</div>';
		target.html(html);
	});
}

//列表菜单的播放暂停按钮的变换 当前点击变换成暂停样式，其他都是播放样式
function listMenuStyleChange(Currindex) {
	search = false; //搜索标志结束
	var currobj = $("#main-list .list-item").eq(Currindex - 1); //获取当前播放对象
	//其他全部变成播放样式,用 not 过滤掉当前元素 
	$(".list-item").not(currobj).each(function(index, el) {
		$(el).find(".icon-play").replaceWith(playTag);
	});
	//自己变成暂停样式
	currobj.find(".icon-play").replaceWith(stopTag);
}

// 移动端列表项单击播放
function mobileClickPlay() {
	if(isMobile) {
		search = false; //搜索标志结束
		krAudio.Currentplay = $(this).index() -1; //当前播放的音乐序号
		krAudio.seturl();
		krAudio.play();
	}
}
function mobileClickPlayMainList() {
	if(isMobile) {
		playlist = "mainLists";
		search = false; //搜索标志结束
		krAudio.Currentplay = $(this).index() -1; //当前播放的音乐序号
		krAudio.seturl();
		krAudio.play();
	}
}
///添加到播放列表
function addSearchList() {
	var index = $(this).index();
	var currentObject = $("#play-main-list .list-item").eq(index); //获取点击的对象
	var urls = currentObject.attr("data-url");
	var pic = currentObject.attr("data-pic");
	var lrc = currentObject.attr("data-lrc");
	var count = mainList.children('.list-item').length;
	var time = currentObject.find(".music-album").first().text();
	var author = currentObject.find(".auth-name").first().text();
	var titles = currentObject.find(".music-name").first().text();
	var htmls = "";
	htmls = `<div class="list-item" data-url="${urls}" data-pic="${pic}" data-lrc="${lrc}">
                <span class="list-num">${count}</span>
                <span class="list-mobile-menu"></span>
                <span class="music-album">${time}</span>
                <span class="auth-name">${author}</span>
                <span class="music-name">${titles}</span>
            </div>`;

	if(listNow.indexOf(urls) == -1) {
		sessionSongs += htmls;
		listNow = listNow.replace('<div class="list-item text-center" title="全部加载完了哦~" id="list-foot">全部加载完了哦~</div>', '');
		listNow += htmls;

		listNow += `<div class="list-item text-center" title="全部加载完了哦~" id="list-foot">全部加载完了哦~</div>`
		loading("添加到播放列表中~~傻猪!", 6);
		//添加喜欢的数据到session
		localStorage.setItem('songsList', '' + sessionSongs + '');
		//添加到列表中
		mainList.html(listNow);
		// 播放列表滚动到顶部
		listToTop();
		tzUtil.animates($("#tzloading"), "slideUp"); //加载动画消失
		//刷新播放列表的总数
		krAudio.allItem = mainList.children('.list-item').length - 1; //减去最后一个提示框
		//更新列表小菜单
		appendlistMenu();
		//移动端列表点击播放
		mainList.find(".list-item").click(mobileClickPlay);
		//移动端列表右边信息按钮的点击
		$(".list-mobile-menu").click(mobileListMenu);
	} else {
		loading("已经添加了该歌单了~笨猪", 5);
	}

}

//点击右下方的下载按钮
$(".btn-download").click(function() {
	//如果未选择音乐，不能下载
	if(krAudio.Currentplay == 0) {
		loading("选择播放的歌曲哦~", 5);
		return;
	}
	var obj = $("#main-list .list-item").eq(krAudio.Currentplay - 1); //当前播放对象
	var url = obj.data("url");
	var title = obj.find(".music-name-cult").text();
	thisDownload(url, title);
});

// 下载正在播放的这首歌
function thisDownload(url, title) {
	//下载
	var eledow = dom("downabo");
	eledow.setAttribute("href", url);
	eledow.setAttribute("download", title + ".mp3");
	eledow.click();
};
/* ------------------------------------顶部按钮处理------------------------------------------------*/
// 移动端顶部按钮点击处理
$(".btn").click(function() {
	switch($(this).data("action")) {
		case "player": // 播放器
			dataBox("player");
			break;
		case "list": // 精品歌单
			dataBox("list"); // 精品歌单
			break;
		case "listTwo": // 热门歌单
			dataBox("listTwo"); // 热门歌单
			break;
		case "listThree": // 分类歌单
			dataBox("listThree"); // 分类歌单
			break;
	}
});

// 移动端选择顶部栏要显示的信息
// 参数：要显示的信息（list、player）
function dataBox(choose) {
	$('.btn-box .active').removeClass('active');
	switch(choose) {
		case "list": // 显示播放列表
			if($(".btn[data-action='player']").css('display') !== 'none') {
				$("#player").hide();
			} else if($("#player").css('display') == 'none') {
				$("#player").fadeIn();
			}
			if(playlist == "fineListTab" && (boxSongList.children('.list-item').length - 1) >1)
			{
				$("#fineList").fadeOut();
				$("#hostList").fadeOut();//热门
				$("#typeList").fadeOut();//分类
				$("#boxSongList").fadeIn();//详情歌单
			}
			else
			{
				$("#fineList").fadeIn();
				$("#hostList").fadeOut();//热门
				$("#typeList").fadeOut();//分类
				$("#boxSongList").fadeOut();//详情歌单
			}
			searchList.fadeOut();
			$("#sheet").fadeOut();
			$(".serchsongs").show(); //搜索栏显示
			$(".btn[data-action='list']").addClass('active');
			$(".serchsongs").hide();//搜索栏隐藏
			fineListBox();
			break;
		case "player": // 显示播放器
			$("#player").fadeIn();
			$("#sheet").fadeOut();
			searchList.fadeOut();
			$(".serchsongs").hide(); //搜索栏隐藏
			$(".btn[data-action='player']").addClass('active');
			if($("#krserwords").val().length > 0) {
				$("play-main-list").hide();
			} else {
				$("#fineList").hide();
				$("play-main-list").hide();
				$("#typeList").hide();
			}
			$("#fineList").hide();//精品
			$("#hostList").hide();//热门
			$("#typeList").hide();//分类
			$("#boxSongList").fadeOut();//详情歌单
			break;
		case "listTwo":
			if($(".btn[data-action='player']").css('display') !== 'none') {
				$("#player").hide();
			} else if($("#player").css('display') == 'none') {
				$("#player").fadeIn();
			}
			if(playlist == "hostListTab" && (boxSongList.children('.list-item').length - 1) >1)
			{
				$("#fineList").fadeOut();
				$("#hostList").fadeOut();//热门
				$("#typeList").fadeOut();//分类
				$("#boxSongList").fadeIn();//详情歌单
			}
			else
			{
				$("#fineList").fadeOut();
				$("#hostList").fadeIn();//热门
				$("#typeList").fadeOut();//分类
				$("#boxSongList").fadeOut();//详情歌单
			}
			$(".serchsongs").hide();//搜索栏隐藏
			searchList.fadeOut();
			$("#sheet").fadeOut();
			$(".serchsongs").hide(); //搜索栏显示
			$(".btn[data-action='listTwo']").addClass('active');
			hostListBox();
			break;

		case "listThree":
			if($(".btn[data-action='player']").css('display') !== 'none') {
				$("#player").hide();
			} else if($("#player").css('display') == 'none') {
				$("#player").fadeIn();
			}
			$(".btn[data-action='listThree']").addClass('active');
			
			if(playlist == "searchList" && (searchList.children('.list-item').length - 1) >1)
			{
				$("#fineList").fadeOut();
				$("#hostList").fadeOut();//热门
				$("#typeList").fadeOut();//分类
				$("#boxSongList").fadeOut();//详情歌单
				$("#play-main-list").fadeIn();//搜索详情
			}
			else
			{
				$("#fineList").fadeOut();
				$("#hostList").fadeOut();//热门
				$("#typeList").fadeOut();//分类
				$("#boxSongList").fadeOut();//详情歌单
				$("#play-main-list").fadeOut();//
			}
			$(".serchsongs").show();//搜索栏隐藏
			searchList.fadeIn();
			break;
	}
}
//点击顶部不同分类框的box事件
function fineListBox()
{
	$.ajax({
		//		url: 'https://api.hibai.cn/api/index/index',
		//		type: 'POST',
		//		data: {"TransCode":"020337","OpenId":"Test","Body":{}},
		url: 'https://xxxxxxxxxxxxx',  //访问https://www.bzqll.com/   获取接口
		type: 'GET',
		data: {
			"key": "xxxxxxxxx",//访问https://www.bzqll.com/   获取key
			"cat": "全部",
			"limit": "200"
		},
		success: function(data) {
			var boxArrys = data.data.playlists; //是个数组对象，存放多个json数据
			var length = boxArrys.length;
			var html = ``;
			for(var vals of boxArrys) {
				var ctime = krAudio.format(vals.time);
				html += `<div class="music-list-box" name="fineListTab">
		            		<div >
		            			<img src="${vals.coverImgUrl}" style="width: 8em;height: 8em;"/>
		            		</div>
		            		<div class="line-box-text">
		            			<span>${vals.title}</span>
		            		</div>
		            		<div id="${vals.id}" class="list-box-id"></div>
		            	</div>`;
			}
			fineList.html(html);
			fineList.find(".music-list-box").click(boxListDetail);
		}
	});
}
function hostListBox()
{
	$.ajax({
		//		url: 'https://api.hibai.cn/api/index/index',
		//		type: 'POST',
		//		data: {"TransCode":"020337","OpenId":"Test","Body":{}},
		url: 'https://xxxxxxxxxxx',//访问https://www.bzqll.com/   获取接口
		type: 'GET',
		data: {
			"key": "xxxxxxxxxx",//访问https://www.bzqll.com/   获取key
			"cat": "全部",
			"limit": "200",
			"offset":"0",
			"order":"hot"
		},
		success: function(data) {
			var boxArrys = data.data; //是个数组对象，存放多个json数据
			var length = boxArrys.length;
			var html = ``;
			for(var vals of boxArrys) {
				var ctime = krAudio.format(vals.time);
				html += `<div class="music-list-box" name="hostListTab">
		            		<div >
		            			<img src="${vals.coverImgUrl}" style="width: 8em;height: 8em;"/>
		            		</div>
		            		<div class="line-box-text">
		            			<span>${vals.title}</span>
		            		</div>
		            		<div id="${vals.id}" class="list-box-id"></div>
		            	</div>`;
			}
			hostList.html(html);
			hostList.find(".music-list-box").click(boxListDetail);
		}
	});
}
/* 初始化背景根据图片虚化效果 */
function initblurImgs() {
	if(isMobile) { // 移动端采用另一种模糊方案
		$('#blur-img').html('<div class="blured-img" id="mobile-blur"></div><div class="blur-mask mobile-mask"></div>');
	} else {
		// 背景图片初始化
		$('#blur-img').backgroundBlur({
			//imageURL : imageURL, // URL to the image that will be used for blurring
			blurAmount: 50, // 模糊度
			imageClass: 'blured-img', // 背景区应用样式
			overlayClass: 'blur-mask', // 覆盖背景区class，可用于遮罩或额外的效果
			duration: 1000, // 图片淡出时间
			endOpacity: 1 // 图像最终的不透明度
		});
	}

	$('.blur-mask').fadeIn(1000); // 遮罩层淡出
}

/* 更换背景图片，动画效果 */
function blurImages(img) {
	var animate = false;
	var imgload = false;
	if(isMobile) {
		$("#music-cover").load(function() {
			$("#mobile-blur").css('background-image', 'url("' + img + '")');
		});
	} //PC端封面
	else if(!isMobile) {
		$("#music-cover").load(function() {
			if(animate) { // 渐变动画也已完成
				$("#blur-img").backgroundBlur(img); // 替换图像并淡出
				$("#blur-img").animate({
					opacity: "1"
				}, 1500); // 背景更换特效
			} else {
				imgload = true; // 告诉下面的函数，图片已准备好
			}

		});

		// 渐变动画
		$("#blur-img").animate({
			opacity: "0.2"
		}, 1000, function() {
			if(imgload) { // 如果图片已经加载好了
				$("#blur-img").backgroundBlur(img); // 替换图像并淡出
				$("#blur-img").animate({
					opacity: "1"
				}, 1500); // 背景更换特效
			} else {
				animate = true; // 等待图像加载完
			}
		});
	}
}

// 图片加载失败处理
$('img').error(function() {
	$(this).attr('src', 'images/player_cover.png');
});

//判断非空
function isEmpty(val) {
	val = $.trim(val);
	if(val == null)
		return true;
	if(val == undefined || val == 'undefined')
		return true;
	if(val == "")
		return true;
	if(val.length == 0)
		return true;
	if(!/[^(^\s*)|(\s*$)]/.test(val))
		return true;
	return false;
}

/* 默认首页是音乐音乐热歌榜，处理返回的json数据用了一点es6的语法 */
function indexSong() {
	var count = 1;
	loading("加载中...", 500);
	$.ajax({
		//		url: 'https://api.hibai.cn/api/index/index',
		//		type: 'POST',
		//		data: {"TransCode":"020337","OpenId":"Test","Body":{}},
		url: 'https://xxxxxxxxxxxx',//访问https://www.bzqll.com/   获取接口
		type: 'GET',
		data: {
			"key": "xxxxxxxxxxxxxxxx",//访问https://www.bzqll.com/   获取key
			"id": "3778678",
			"limit": "200",
			"offset": "0"
		},
		success: function(data) {
			var NECsongs = data.data.songs; //是个数组对象，存放多个json数据
			var length = NECsongs.length;
			var html = `<div class="listitems list-head">
		                    <span class="music-album">时长</span>
		                    <span class="auth-name">歌手</span>
		                    <span class="music-name">歌曲</span>
		                </div>`;
			for(var vals of NECsongs) {
				var ctime = krAudio.format(vals.time);
				html += `<div class="list-item" data-url="${vals.url}" data-pic="${vals.pic}" data-lrc="${vals.lrc}">
	                    <span class="list-num">${count}</span>
	                    <span class="list-mobile-menu"></span>
	                    <span class="music-album">${ctime}</span>
	                    <span class="auth-name">${vals.singer}</span>
	                    <span class="music-name">${vals.name}</span>
	                </div>`;
				count++;
			}
			if(localStorage.getItem("songsList") != null && localStorage.getItem("songsList") != "") {
				html += localStorage.getItem("songsList");
			}

			listNow = html;
			html += `<div class="list-item text-center" title="全部加载完了哦~" id="list-foot">全部加载完了哦~</div>`;
			//添加到列表中
			mainList.html(html);
			// 播放列表滚动到顶部
			listToTop();
			tzUtil.animates($("#tzloading"), "slideUp"); //加载动画消失
			//刷新播放列表的总数
			krAudio.allItem = mainList.children('.list-item').length - 1; //减去最后一个提示框
			//更新列表小菜单
			appendlistMenu();
			//移动端列表点击播放
			mainList.find(".list-item").click(mobileClickPlayMainList);
			//移动端列表右边信息按钮的点击
			$(".list-mobile-menu").click(mobileListMenu);
		}
	});
	fineListBox();
};
/* 分类列表框点击事件 */
function boxListDetail() {
	var count = 1;
	var currentObject = "";
	var index = $(this).index();
	var topBtn = $(this).attr("name");//获取顶部按钮标识符name
	if(topBtn == "fineListTab")
	{
		playlist = "fineListTab";//全局变量赋值为播放公共方法区分列表
		currentObject = $("#fineList").find(".list-box-id").eq(index); //获取点击的对象
	}
	if(topBtn == "hostListTab")
	{
		playlist = "hostListTab";//全局变量赋值为播放公共方法区分列表
		currentObject = $("#hostList").find(".list-box-id").eq(index); //获取点击的对象
	}
	var listId = currentObject.attr("id");
	loading("加载中...", 500);
	$.ajax({
		//		url: 'https://api.hibai.cn/api/index/index',
		//		type: 'POST',
		//		data: {"TransCode":"020337","OpenId":"Test","Body":{}},
		url: 'https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',//访问https://www.bzqll.com/   获取接口
		type: 'GET',
		data: {
			"key": "xxxxxxxxx",//访问https://www.bzqll.com/   获取key
			"id": "" + listId + "",
			"limit": "200",
			"offset": "0"
		},
		success: function(data) {
			$(".music-list-box").hide();
			var NECsongs = data.data.songs; //是个数组对象，存放多个json数据
			var length = NECsongs.length;
			var html = `<button id="returns" class="listReturn" name="${topBtn}" onclick = "returnsList();">
		            		<span></span>
		            	</button>
						<div class="listitems list-head">
		                    <span class="music-album">时长</span>
		                    <span class="auth-name">歌手</span>
		                    <span class="music-name">歌曲</span>
		                </div>`;
			for(var vals of NECsongs) {
				var ctime = krAudio.format(vals.time);
				html += `<div class="list-item" data-url="${vals.url}" name="${topBtn}" data-pic="${vals.pic}" data-lrc="${vals.lrc}">
	                    <span class="list-num">${count}</span>
	                    <span class="list-mobile-menu"></span>
	                    <span class="music-album">${ctime}</span>
	                    <span class="auth-name">${vals.singer}</span>
	                    <span class="music-name">${vals.name}</span>
	                </div>`;
				count++;
			}
			html += `<div class="list-item text-center" title="全部加载完了哦~" id="list-foot">全部加载完了哦~</div>`;
			//添加到列表中
			boxSongList.html(html);
			$("#boxSongList").fadeIn();
			search = true; //搜索标志
			//播放列表滚动到顶部
			listToTop();
			tzUtil.animates($("#tzloading"), "slideUp"); //加载动画消失
			//刷新播放列表的总数
			krAudio.allItem = boxSongList.children('.list-item').length -1; //减去最后一个提示框
			//更新列表小菜单
			appendlistMenu();
			//移动端列表点击播放
			boxSongList.find(".list-item").click(addSearchList);
			boxSongList.find(".list-item").click(mobileClickPlay);
			//移动端列表右边信息按钮的点击
			$(".list-mobile-menu").click(mobileListMenu);
		}
	})
}
/* 更据关键词搜索，处理返回的json数据用了一点es6的语法 接入qq音乐搜索 */
function searchSong(keywords) {
	$("#krserwords").blur(); //文本框失焦
	$("#fineList").hide(); //分类俩表隐藏
	playlist = "searchList"
	var count = 1;
	loading("搜索中...", 500);
	$.ajax({
		//		url: 'https://api.hibai.cn/api/index/index',
		//		type: 'POST',
		//		data: {"TransCode":"020441","OpenId":"Test","Body":{"key":keywords}},
		url: 'https://xxxxxxxxxxxxxxxxxxxxxxxxxx',//访问https://www.bzqll.com/   获取接口
		type: 'GET',
		data: {
			"key": "xxxxxxxxxxxxxxx",//访问https://www.bzqll.com/   获取key
			"s": "" + keywords + "",
			"type": "song",
			"limit": "100",
			"offset": "0"
		},
		success: function(data) {
			var NECsongs = data.data; //是个数组对象，存放多个json数据
			var length = NECsongs.length;
			var html = `<div class="listitems list-head">
		                    <span class="music-album">时长</span>
		                    <span class="auth-name">歌手</span>
		                    <span class="music-name">歌曲</span>
		                </div>`;
			for(var vals of NECsongs) {
				var ctime = krAudio.format(vals.time);
				html += `<div class="list-item" data-url="${vals.url}" data-pic="${vals.pic}" data-lrc="${vals.lrc}">
	                    <span class="list-num">${count}</span>
	                    <span class="list-mobile-menu"></span>
	                    <span class="music-album">${ctime}</span>
	                    <span class="auth-name">${vals.singer}</span>
	                    <span class="music-name">${vals.name}</span>
	                </div>`;
				count++;
			}
			html += `<div class="list-item text-center" title="全部加载完了哦~" id="list-foot">全部加载完了哦~</div>`;
			//添加到列表中
			searchList.html(html);
			search = true; //搜索标志
			//播放列表滚动到顶部
			listToTop();
			tzUtil.animates($("#tzloading"), "slideUp"); //加载动画消失
			//刷新播放列表的总数
			krAudio.allItem = searchList.children('.list-item').length - 1; //减去最后一个提示框
			//更新列表小菜单
			appendlistMenu();
			//移动端列表点击播放
			searchList.find(".list-item").click(addSearchList);
			//移动端列表右边信息按钮的点击
			$(".list-mobile-menu").click(mobileListMenu);
		}
	});
}

// 播放列表滚动到顶部
function listToTop() {
	if(isMobile) $("#main-list").animate({
		scrollTop: 0
	}, 200);
	else $("#main-list").mCustomScrollbar("scrollTo", 0, "top");
	if(isMobile) $("#play-main-list").animate({
		scrollTop: 0
	}, 200);
	else $("#play-main-list").mCustomScrollbar("scrollTo", 0, "top");
};
/* 点击搜索按钮或者在文本框回车搜索 */
$(".searchDivIcon").click(function() {
	var keywords = $("#krserwords").val();
	if(isEmpty(keywords)) return;
	searchSong(keywords); //进行搜索
});

$("#krserwords").keyup(function(event) {
	var keywords = $("#krserwords").val();
	if(event.keyCode == 13) {
		if(isEmpty(keywords)) return;
		searchSong(keywords); //进行搜索
	}
});
//点击返回返回到listbox列表推荐
function returnsList() {
	var topBtn = $("#returns").attr("name");
	$("#boxSongList").fadeOut();
	if(playlist == "fineListTab")
	{
		$("#fineList").fadeIn();
	}
	if(playlist == "hostListTab")
	{
		$("#hostList").fadeIn();
	}
	playlist = "";
//	if(topBtn == "fineListTab")
//	{
//		fineListBox();
//		
//	}else if(topBtn == "hostListTab")
//	{
//		hostListBox();
//	}
};
/* 监控文本框输入内容 隐藏显示删除按钮 */
$("#krserwords").bind("input propertychange change", function() {
	var cName = document.getElementById("iconDelete");
	if($("#krserwords").val().length > 0 && $("#krserwords").val() != null && $("#krserwords").val() != "") {
		cName.classList.remove("icondel");
	} else {
		cName.classList.add("icondel");
	}
});
/* 删除按钮事件 */
$(".searchDeleteIcon").click(function() {
	var cName = document.getElementById("iconDelete");
	$("#krserwords").val("");
	$("#krserwords").focus();//保持聚焦
	cName.classList.add("icondel");
	$("#fineList").fadeIn();
	searchList.html("");
	appendlistMenu();
});

//当前播放歌曲的详细信息的按钮点击
$("#music-info").click(function() {
	if(isEmpty(krAudio.audioDom.src)) {
		loading("选择播放的歌曲哦~", 5);
	} else {
		musicInfo(krAudio.Currentplay - 1);
	}
});

//移动端的每首歌点击详细信息的按钮
function mobileListMenu() {
	var index = $(this).parents(".list-item").index();
	musicInfo(index - 1);
	//取消冒泡，防止点击播放
	return false;
};

// 展现系统列表中任意首歌的歌曲信息（或者当前歌曲）
function musicInfo(index) {
	var currentObject = $("#main-list .list-item").eq(index); //获取点击的对象
	var title = currentObject.find(".music-name-cult").text();
	var url = currentObject.data("url");
	var lrc = currentObject.data("lrc");
	var tempStr = `<span class="info-title">歌曲：</span> ${title}
				    <br><span class="info-title">歌手：</span> ${currentObject.find(".auth-name").text()}
				    <br><span class="info-title">时长：</span> ${currentObject.find(".music-album").text()}`;

	tempStr += `<br><span class="info-title">链接：</span>
    		<span class="info-btn" id="info-songs" data-text="${url}">歌曲&nbsp;&nbsp;</span>
    		<span class="info-btn" id="info-lrcs" data-text="${lrc}">歌词</span><br>
    		<span class="info-title">操作：</span>
    		<span class="info-btn" onclick="thisDownload('${url}','${title}')">下载</span>`;

	layer.open({
		type: 0,
		closeBtn: 0,
		shadeClose: true,
		title: false, //不显示标题
		btn: false,
		skin: 'mylayerClass',
		content: tempStr
	});
	/* 实现点击复制歌曲链接、歌词链接 */
	zclips("#info-songs");
	zclips("#info-lrcs");
}

/* 实现点击复制歌曲链接、歌词链接 */
function zclips(obj) {
	var clipboard = new ClipboardJS(obj, {
		text: function() {
			return $(obj).data("text");
		}
	});

	clipboard.on('success', function(e) {
		loading("复制成功", 3);
	});

	clipboard.on('error', function(e) {
		loading("复制失败", 3);
	});
}