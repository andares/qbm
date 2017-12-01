# -*- coding: utf-8 -*-
import urllib2
from urlparse import urlparse
from urlparse import parse_qs
import re

class NoRedirection(urllib2.HTTPErrorProcessor):
  def http_response(self, request, response):
    return response
  https_response = http_response

opener = urllib2.build_opener(NoRedirection)

lion_domain = "api.shihoutv.com";

def onQQMessage(bot, contact, member, content):
    global lion_domain;

    if member or (contact is None) or contact.qq == "#NULL":
        return 1

    port = bot.conf.pluginsConf.get('botport', '14990');
    apiurl = bot.conf.pluginsConf.get('apiurl', 'http://test.api.shihou.tv/api/thirdparty/qqbot/');

    content = content.strip();

    # parsed = urlparse(content);

    pattern = re.compile(r'.*(http[s]?:\/\/[a-zA-Z0-9\.]+\/[a-zA-Z0-9]+)')
    match = pattern.match(content)

    if content == '验证主播':
        response = urllib2.urlopen(apiurl+"check-auth?qq="+contact.qq);
        bot.SendTo(contact, response.read())
    elif match is not None:
        response = urllib2.urlopen(apiurl+"send-game-link?qq="+contact.qq+"&url="+match.group(1));
        bot.SendTo(contact, response.read())

    # elif parsed.hostname is not None:
    #     # 处理短链接
    #     if parsed.hostname == "url.cn":
    #         parsed  = urlparse(opener.open(content).info().getheader('Location'))

    #     query = parse_qs(parsed.query)
    #     if parsed.hostname == "gamecenter.qq.com"\
    #         and query.has_key('appid')\
    #         and query['appid'][0] == '1104512706':
    #         response = urllib2.urlopen(apiurl+"send-game-link?qq="+contact.qq+"&url="+content);
    #         bot.SendTo(contact, "[穿越火线] "+response.read())
    #     elif parsed.hostname == "gamecenter.qq.com"\
    #         and query.has_key('appid')\
    #         and query['appid'][0] == '1104466820':
    #         response = urllib2.urlopen(apiurl+"send-game-link?qq="+contact.qq+"&url="+content);
    #         bot.SendTo(contact, "[王者荣耀] "+response.read())
    #     else:
    #         bot.SendTo(contact, "无法识别输入的信息")
    # elif content.decode('utf-8')[0:12].encode('utf-8') == '我刚刚建立了一支团战队伍':
    #     pattern = re.compile(r'^.*(http:\/\/t\.cn\/[a-zA-Z0-9]+)$')
    #     match = pattern.match(content)
    #     if match:
    #         response = urllib2.urlopen(apiurl+"send-game-link?qq="+contact.qq+"&url="+match.group(1));
    #         bot.SendTo(contact, "[球球大作战] "+response.read()+" "+match.group(1))
    #     else:
    #         bot.SendTo(contact, "无法识别输入的信息")
    else:
        bot.SendTo(contact, '我是狮小Q。你可以说【验证主播】，来确定自己QQ关联的帐号是否正确。确定身份后，可以直接将游戏中的组队链接复制/分享到QQ中告诉我，我会转发到你的直播间。目前支持的游戏： 穿越火线 , 王者荣耀 , 球球大作战')