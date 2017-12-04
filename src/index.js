import $ from 'jquery'
import './style.css'

var EventCenter = {
  on: function (type, handler) {
    $(document).on(type, handler)
  },
  fire: function (type, data) {
    $(document).trigger(type, data)
  }
}
//事件发布模式

var footer = {
  init: function () {
    this.$footer = $('footer')
    this.$ul = this.$footer.find('ul')
    this.$box = this.$footer.find('.box')
    this.$leftBtn = this.$footer.find('.icon-left')
    this.$rightBtn = this.$footer.find('.icon-right')
    this.isToEnd = false
    this.isToStart = true
    this.isAnimate = false
    this.getData()
    this.bind()
  },
  bind: function () {
    var _this = this
    this.$rightBtn.on('click', function () {
      if (_this.isAnimate) return

      var itemWidth = _this.$box.find('li').outerWidth(true)
      var rowCount = Math.floor(_this.$box.width() / itemWidth)
      if (!_this.isToEnd) {
        _this.isAnimate = true
        _this.$ul.animate({
          left: '-=' + rowCount * itemWidth
        }, 400, function () {
          _this.isAnimate = false
          _this.isToStart = false
          if (parseFloat(_this.$box.width()) - parseFloat(_this.$ul.css('left')) >= parseFloat(_this.$ul.css('width'))) {
            _this.isToEnd = true
          }
        })
      }
    })

    this.$leftBtn.on('click', function () {
      if (_this.isAnimate) return
      var itemWidth = _this.$box.find('li').outerWidth(true)
      var rowCount = Math.floor(_this.$box.width() / itemWidth)
      if (!_this.isToStart) {
        _this.isAnimate = true
        _this.$ul.animate({
          left: '+=' + rowCount * itemWidth
        }, 400, function () {
          _this.isToEnd = false
          _this.isAnimate = false
          if (parseFloat(_this.$ul.css('left')) >= 0) {
            _this.isToStart = true
          }
        })
      }
    })
    this.$footer.on('click', 'li', function () {
      $(this).addClass('active').siblings().removeClass('active')

      EventCenter.fire('selectAlbumn', {
        channelId: $(this).attr('data-channel-id'),
        channelName: $(this).attr('data-channel-name')
      })
    })
  },
  getData: function () {
    var _this = this
    $.getJSON('https://jirenguapi.applinzi.com/fm/getChannels.php').done(function (ret) {
      console.log(ret)
      _this.render(ret)
    }).fail(function () {
      console.log('获取数据失败')
    })
  },
  render: function (data) {
    var _this = this
    var html = ''
    data.channels.forEach(function (channel) {
      html += '<li data-channel-id=' + channel.channel_id + ' data-channel-name=' + channel.name + '>' +
        '<div class="cover" style="background-image:url(' + channel.cover_small + ')"></div>' +
        '<h3>' + channel.name + '</h3>' +
        '</li>'
      _this.$ul.html(html)
    })
    this.setStyle()
  },
  setStyle: function () {
    var liAmount = this.$footer.find('li').length
    var liWidth = this.$footer.find('li').outerWidth(true)
    this.$ul.css({
      width: liAmount * liWidth + 'px'
    })
  }
}
//
var Fm = {
  init: function () {
    this.audio = new Audio()
    this.audio.autoplay = true
    this.channelId
    this.channelName
    this.song
    this.$container = $('#page-music')
    this.bind()
  },
  bind: function () {
    var _this = this
    EventCenter.on('selectAlbumn', function (e, channelObj) {
      _this.channelName = channelObj.channelName
      _this.channelId = channelObj.channelId
      _this.loadMusic(function () {
        _this.setMusic()
      })
    })

    this.$container.find('.btn-play').on('click', function () {
      var $btn = $(this)
      if ($btn.hasClass('icon-bofang')) {
        $btn.removeClass('icon-bofang').addClass('icon-zanting')
        _this.audio.play()
      } else {
        $btn.removeClass('icon-zanting').addClass('icon-bofang')
        _this.audio.pause()
      }
    })

    this.$container.find('.icon-next').on('click', function () {
      _this.loadMusic(function () {
        _this.setMusic()
      })
    })

    this.$container.find('.btn-collect').on('click', function () {
      if ($(this).hasClass('active')) {
        $(this).removeClass('active')
      } else {
        $(this).addClass('active')
      }
    })

    this.audio.addEventListener('play', function () {
      clearInterval(_this.clock)
      _this.clock = setInterval(function () {
        _this.updateStatus()
      }, 1000)
    })
    this.audio.addEventListener('pause', function () {
      clearInterval(_this.clock)
    })
  },
  loadMusic: function (callback) {
    var _this = this
    $.getJSON('https://jirenguapi.applinzi.com/fm/getSong.php', {
      channel: this.channelId
    }).done(function (ret) {
      _this.song = ret['song'][0]
      callback()
    })
  },
  loadLyric: function () {
    var _this = this
    $.getJSON('https://jirenguapi.applinzi.com/fm/getLyric.php', {
      sid: this.song.sid
    }).done(function (ret) {
      var lyric = ret.lyric
      var lyricObj = {}
      lyric.split('\n').forEach(function (line) {
        var times = line.match(/\d{2}:\d{2}/g)
        var str = line.replace(/\[.+?\]/g, '')
        if (Array.isArray(times)) {
          times.forEach(function (time) {
            lyricObj[time] = str
          })
        }
      })
      _this.lyricObj = lyricObj
    })
  },
  setMusic: function () {
    this.$container.find('.btn-play').removeClass('icon-bofang').addClass('icon-zanting')
    this.audio.src = this.song.url
    $('.bg').css('background-image', 'url(' + this.song.picture + ')')
    this.$container.find('aside figure').css('background-image', 'url(' + this.song.picture + ')')
    this.$container.find('.panel h2').text(this.song.title)
    this.$container.find('.panel .artist').text(this.song.artist)
    this.$container.find('.panel .tag').text(this.channelName)
    this.loadLyric()
  },
  updateStatus: function () {
    var min = Math.floor(this.audio.currentTime / 60)
    var sec = Math.floor(this.audio.currentTime % 60) + ''
    sec = sec.length === 2 ? sec : '0' + sec
    this.$container.find('.time').text(min + ":" + sec)
    this.$container.find('.progress').css('width', this.audio.currentTime / this.audio.duration * 100 + '%')

    var line = this.lyricObj['0' + min + ':' + sec]
    if (line) {
      this.$container.find('.lyric p').text(line)
    }
  }
}
footer.init()
Fm.init()