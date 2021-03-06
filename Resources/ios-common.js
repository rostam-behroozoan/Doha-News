var get_relative_time = exports.get_relative_time = function(date){
	var text;
	var dateTime = date.split(' ');
	
	var pDate = dateTime[0].split('-');
	pYear = parseInt(pDate[0],10);
	pMonth = parseInt(pDate[1],10);
	pDay= parseInt(pDate[2],10);

	var pTime = dateTime[1].split(':');
	pHour = parseInt(pTime[0],10);
	pMin = parseInt(pTime[1],10);
	
	var currentTime = new Date();
	var zone = (currentTime.getTimezoneOffset())/60;
	currentTime = new Date(new Date()*1 + (1000*3600*(3+zone)));
	var hours = parseInt(currentTime.getHours(),10);
	var minutes = parseInt(currentTime.getMinutes(),10);
	var year = parseInt(currentTime.getFullYear(),10);
	var month = parseInt(currentTime.getMonth()+1,10);
	var day = parseInt(currentTime.getDate(),10);

	if (year == pYear && month == pMonth && day == pDay){
		
		if (pHour == hours){
			if (pMin == minutes)
				text = 'Just now';
			else{
				diff = Math.abs(pMin - minutes);
				text = diff == 1? diff + ' minute ago' : diff + ' minutes ago';
			}
		}
		else{
			diff = Math.abs(pHour - hours);
			if (diff == 1){
				diff = pMin - minutes;

				if (diff > 0){
					diff = 60 - diff;
					text = diff == 1? diff + ' minute ago' : diff + ' minutes ago';
				}
				else
					text = 'an hour ago';
			}
			else{
				text = diff + ' hours ago';
			}
		}
	}
	else{
		if (pYear == year){
			if (pMonth == month){
				diff = Math.abs(pDay - day);
				text = diff == 1? 'Yesterday' : diff + ' days ago';
			}
			else{
				diff = Math.abs(pMonth - month);
				text = diff == 1? 'Last month' : diff + ' months ago';
			}	
		}
		else{
			diff = Math.abs(pYear - year);
			text = diff == 1? 'Last year' : diff + ' years ago';
		}	
	}
	
	return text;
};


var create_date_label = function(date){
	
	var text = get_relative_time(date);
	
	var dateLabel = Ti.UI.createLabel({
		text: text,
		backgroundColor: 'transparent',
		font:{
			fontSize: '12dp',
			fontFamily: 'Helvetica-Bold',
		},
		color: 'gray',
		bottom: 0,
	}); 
	return dateLabel;
};

exports.make_content_view = function(title, content, thumbnail, url, id, date, author, modified, loadFromDictionary) {

	var content_view = Ti.UI.createView({
		height: Ti.Gesture.landscape? '110dp': '90dp',
		width: Titanium.Platform.displayCaps.platformWidth,
		left: 0,
		backgroundColor: 'white',
		zIndex: 500,
	});
	
	var thumb = Ti.UI.createImageView({
		height: Ti.Gesture.landscape? '90dp': '70dp',
		width: Ti.Gesture.landscape? '90dp': '70dp',
		left: '5dp',
		image: thumbnail,
	});

	var textView = Ti.UI.createView({
		//top: '0dp',
		left: Ti.Gesture.landscape? '105dp': '85dp',
		right: '20dp',
		height: Ti.Gesture.landscape? '90dp':'70dp',
		top: '10dp',
		layout: 'vertical',
	});
	
	var authorTimeView = Ti.UI.createView({
		//top: '2dp',
		// left: '80dp',
		// right: '20dp',
		left: 0,
		backgroundColor:'transparent',
		layout: 'horizontal',
	});
	
	var titleLabel = Ti.UI.createLabel({
		text: title,
		color:'#4A4A4A',
		ellipsize: true,
		left: 0,
		height: '57dp',
		verticalAlign: Titanium.UI.TEXT_VERTICAL_ALIGNMENT_TOP,
		font: {
			fontSize: Ti.Gesture.landscape? '18dp': '15dp',
			fontFamily: 'Helvetica-Bold',
		},
		backgroundColor:'transparent',
	});
	
	var authorLabel = Ti.UI.createLabel({
		text: author,
		color:'#70193c',
		// top: '0dp',
		// left: '80dp',
		// right: '20dp',
		left: '3dp',
		height: Ti.UI.SIZE,
		font: {
			fontSize: '12dp',
			fontFamily: 'Helvetica',
		},
		backgroundColor:'transparent',
	});
	
	var date_label = create_date_label(date);
	textView.add(titleLabel);
	authorTimeView.add(date_label);
	authorTimeView.add(authorLabel);
	textView.add(authorTimeView);
	content_view.add(thumb);
	content_view.add(textView);

	var row = Ti.UI.createTableViewRow({
		height: Ti.Gesture.landscape? '110dp' : '90dp',
		width: Ti.Platform.displayCaps.platformWidth,
		backgroundColor:'#fff',
		className: 'article',
		url: url,
		content: content,
		articleTitle: title,
		id: id,
		author: author,
		date: date,
		modified: modified,
		date_label: date_label,
		title_label: titleLabel,
		text_view: textView,
		content_view: content_view,
		thumb: thumb,
	});

	row.articleRow = content_view;
	row.sharing = create_sharing_options_view(url, title, content, thumbnail, id, date, author);
	row.add(row.sharing);
	row.add(row.articleRow);
	
	row.addEventListener('swipe', sharing_animation);
	
	row.articleRow.addEventListener ('click', function(e){
		var articleWindow;
		if (loadFromDictionary)
			articleWindow = Ti.UI.createWindow({
				backgroundColor:'#fff',
				url: 'detail.js',
				modal: true,
				content: table_rows[id].content, 
				id: table_rows[id].id,
				articleUrl: table_rows[id].url,
				articleTitle: table_rows[id].articleTitle,
				thumbnail: table_rows[id].thumb.image,
				date: table_rows[id].date,
				author: table_rows[id].author,
			});
		else
			articleWindow = Ti.UI.createWindow({
				backgroundColor:'#fff',
				url: 'detail.js',
				modal: true,
				content: content, 
				id: id,
				articleUrl: url,
				articleTitle: title,
				thumbnail: thumbnail,
				date: date,
				author: author,
			});
		articleWindow.addEventListener('close',function(){
			Ti.UI.currentTab.fireEvent('focus');
		});
		articleWindow.open({
			animated:true,
		});
		
		if (!!current_row) {
			current_row.articleRow.animate({
				left: 0,
				duration: 500
			});
			current_row = null;
		}
	});
	
	return row;
};

exports.create_header = function(hideInfo, hideSubmit){
	var header = Titanium.UI.createView({
		backgroundColor: '#f8f8f8',
		top: 0,
		height: '45dp',
		zIndex: 2,
	});
	
	var headerlogo = Ti.UI.createImageView({
		image: 'images/ios-header.png',
		width: '150dp',
		height: '20dp',
		center: {x:Ti.Platform.displayCaps.platformWidth/2, y: 25},
	});

	var headerStrip = Titanium.UI.createView({
		backgroundColor: '#70193c',
		height: '5dp',
		top: 0,
		zIndex: 100,
	});
	
	var headerBottomBorder = Ti.UI.createView({
		backgroundColor: '#b2b2b2',
		height: '1dp',
		bottom: 0,
	});
	
	header.add(headerStrip);
	header.add(headerlogo);
	header.add(headerBottomBorder);
	
	if (!hideSubmit)
	{
		var submit = Ti.UI.createImageView({
			image: 'images/submit.png',
			height: '30dp',
			width: '30dp',
			right: '5dp',
			bubbleParent: false,
		});
		
		submit.addEventListener('click', function(){
			var win = Ti.UI.createWindow({
				backgroundColor:'white',
				url: 'upload_photo.js',
				modal: false,
				navBarHidden: true,
			});
				
			win.open({
				animated:true,
			});	
		});
		
		header.add(submit);
	}
	
	if (!hideInfo){		
		var info = Ti.UI.createImageView({
			image: 'images/info_inactive.png',
			height: '30dp',
			width: '30dp',
			left: '5dp',
			bubbleParent: false,
		});
		
		info.addEventListener('click', function(){
			var aboutWindow = Ti.UI.createWindow({
				backgroundColor:'white',
				url: 'about.js',
				modal: false,
				navBarHidden: true,
			});
			
			aboutWindow.open({
				animated:true,
			});	
		});
		header.add(info);
	}
	return header;
};

exports.create_table_view = function(top){
	top = top || '90dp';
	var table = Ti.UI.createTableView({
		backgroundColor:'white',
		rowHeight: Ti.UI.SIZE,
		top: top,
		left: '5dp',
		right: '5dp',
		bubbleParent: false,
		selectionStyle: 'none',
		separatorColor: '#e9e5df',
	});
	
	return table;
};

exports.dialog = function(title, msg){
	title = title || 'Couldn\'t fetch your articles';
	msg = msg || 'Please check internet connectivity';
	
	var dialog = Ti.UI.createAlertDialog({
		message: msg,
		title: title,
		ok: 'Got it!',
		cancel: -1,
	});
	dialog.show();
};
