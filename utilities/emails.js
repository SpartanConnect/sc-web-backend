/* eslint-disable spellcheck/spell-checker */
var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var Base64 = require('js-base64').Base64;

var announcementUtilities = require('./announcements');

var SCOPES = ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.compose', 'https://www.googleapis.com/auth/gmail.modify', 'https://mail.google.com/'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs-credentials.json';
/* eslint-enable spellcheck/spell-checker */



/**
 * This function generates and returns a filled, plaintext email message. Pass its output to a base64URL encoder and use that to send the email.
 * @param {Object} deniedAnnouncementObject The object for the announcement that was created.
 * @param {Object} adminUserObject The object for the admin which denied the announcement.
 * @param {Object} recipientUserObject The object for the user to which the email should be sent.
 * @param {string|undefined} rejectionReason A string that is the reason that the admin entered to reject the announcement. If no reason is provided, leave the variable undefined.
 * @return {string} A plaintext string of the **unencoded** email message notifiying a submitter of announcement denial by an administrator.
 */
function generateDenialMessage(deniedAnnouncementObject, recipientUserObject, rejectionReason) {
    // eslint-disable-next-line spellcheck/spell-checker, quotes
    return 'Date: ' + new Date().toUTCString() + '\nFrom: Spartan Connect <studentdevteam@mylcusd.net>\nTo: ' + recipientUserObject.name + ' <' + recipientUserObject.email + '>' + '\nSubject: Spartan Connect Announcement Rejection\nContent-Type: text/html; charset=UTF-8\n\n' + `<!DOCTYPE html><head><!--[if gte mso 9]><xml><o:officedocumentsettings><o:allowpng><o:pixelsperinch>96</o:pixelsperinch></o:officedocumentsettings></xml><![endif]--><meta content="text/html; charset=utf-8"http-equiv=Content-Type><meta content="width=device-width"name=viewport><!--[if !mso]><!--><meta content="IE=edge"http-equiv=X-UA-Compatible><!--<![endif]--><title></title><!--[if !mso]><!== --><link href="https://fonts.googleapis.com/css?family=Roboto"rel=stylesheet><!--<![endif]--><style id=media-query>body{margin:0;padding:0}table,td,tr{vertical-align:top;border-collapse:collapse}.ie-browser table,.mso-container table{table-layout:fixed}*{line-height:inherit}a[x-apple-data-detectors=true]{color:inherit!important;text-decoration:none!important}[owa] .img-container button,[owa] .img-container div{display:block!important}[owa] .fullwidth button{width:100%!important}[owa] .block-grid .col{display:table-cell;float:none!important;vertical-align:top}.ie-browser .block-grid,.ie-browser .num12,[owa] .block-grid,[owa] .num12{width:500px!important}.ExternalClass,.ExternalClass div,.ExternalClass font,.ExternalClass p,.ExternalClass span,.ExternalClass td{line-height:100%}.ie-browser .mixed-two-up .num4,[owa] .mixed-two-up .num4{width:164px!important}.ie-browser .mixed-two-up .num8,[owa] .mixed-two-up .num8{width:328px!important}.ie-browser .block-grid.two-up .col,[owa] .block-grid.two-up .col{width:250px!important}.ie-browser .block-grid.three-up .col,[owa] .block-grid.three-up .col{width:166px!important}.ie-browser .block-grid.four-up .col,[owa] .block-grid.four-up .col{width:125px!important}.ie-browser .block-grid.five-up .col,[owa] .block-grid.five-up .col{width:100px!important}.ie-browser .block-grid.six-up .col,[owa] .block-grid.six-up .col{width:83px!important}.ie-browser .block-grid.seven-up .col,[owa] .block-grid.seven-up .col{width:71px!important}.ie-browser .block-grid.eight-up .col,[owa] .block-grid.eight-up .col{width:62px!important}.ie-browser .block-grid.nine-up .col,[owa] .block-grid.nine-up .col{width:55px!important}.ie-browser .block-grid.ten-up .col,[owa] .block-grid.ten-up .col{width:50px!important}.ie-browser .block-grid.eleven-up .col,[owa] .block-grid.eleven-up .col{width:45px!important}.ie-browser .block-grid.twelve-up .col,[owa] .block-grid.twelve-up .col{width:41px!important}@media only screen and (min-width:520px){.block-grid{width:500px!important}.block-grid .col{display:table-cell;Float:none!important;vertical-align:top}.block-grid .col.num12{width:500px!important}.block-grid.mixed-two-up .col.num4{width:164px!important}.block-grid.mixed-two-up .col.num8{width:328px!important}.block-grid.two-up .col{width:250px!important}.block-grid.three-up .col{width:166px!important}.block-grid.four-up .col{width:125px!important}.block-grid.five-up .col{width:100px!important}.block-grid.six-up .col{width:83px!important}.block-grid.seven-up .col{width:71px!important}.block-grid.eight-up .col{width:62px!important}.block-grid.nine-up .col{width:55px!important}.block-grid.ten-up .col{width:50px!important}.block-grid.eleven-up .col{width:45px!important}.block-grid.twelve-up .col{width:41px!important}}@media (max-width:520px){.block-grid,.col{min-width:320px!important;max-width:100%!important}.block-grid{width:calc(100% - 40px)!important}.col{width:100%!important}.col>div{margin:0 auto}img.fullwidth{max-width:100%!important}}</style><body class=clean-body style=margin:0;padding:0;-webkit-text-size-adjust:100%;background-color:#fff><!--[if IE]><div class=ie-browser><![endif]--><!--[if mso]><div class=mso-container><![endif]--><div style="min-width:320px;Margin:0 auto;background-color:#fff"class=nl-container><!--[if (mso)|(IE)]><table width=100% cellpadding=0 cellspacing=0 border=0><tr><td align=center style=background-color:#fff><![endif]--><div style=background-color:transparent><div style="Margin:0 auto;min-width:320px;max-width:500px;width:500px;width:calc(19000% - 98300px);overflow-wrap:break-word;word-wrap:break-word;word-break:break-word;background-color:transparent"class=block-grid><div style=border-collapse:collapse;display:table;width:100%><!--[if (mso)|(IE)]><table width=100% cellpadding=0 cellspacing=0 border=0><tr><td style=background-color:transparent align=center><table cellpadding=0 cellspacing=0 border=0 style=width:500px><tr class=layout-full-width style=background-color:transparent><![endif]--><!--[if (mso)|(IE)]><td align=center width=500 style="width:500px;padding-right:0;padding-left:0;padding-top:5px;padding-bottom:5px;border-top:0 solid transparent;border-left:0 solid transparent;border-bottom:0 solid transparent;border-right:0 solid transparent"valign=top><![endif]--><div style="min-width:320px;max-width:500px;width:500px;width:calc(18000% - 89500px);background-color:transparent"class="col num12"><div style=background-color:transparent;width:100%!important><!--[if (!mso)&(!IE)]><!--><div style="border-top:0 solid transparent;border-left:0 solid transparent;border-bottom:0 solid transparent;border-right:0 solid transparent;padding-top:5px;padding-bottom:5px;padding-right:0;padding-left:0"><!--<![endif]--><div style=padding-right:0;padding-left:0 class="center fullwidth img-container"align=center><!--[if mso]><table width=100% cellpadding=0 cellspacing=0 border=0><tr><td style=padding-right:0;padding-left:0 align=center><![endif]--><img align=center alt=Image border=0 class="center fullwidth"src=https://connect.lchsspartans.net/assets/sc_banner.png style=outline:0;text-decoration:none;-ms-interpolation-mode:bicubic;clear:both;display:block!important;border:0;height:auto;float:none;width:100%;max-width:500px title=Image width=500><!--[if mso]><![endif]--></div><!--[if (!mso)&(!IE)]><!--></div><!--<![endif]--></div></div><!--[if (mso)|(IE)]><![endif]--></div></div></div><div style=background-color:transparent><div style="Margin:0 auto;min-width:320px;max-width:500px;width:500px;width:calc(19000% - 98300px);overflow-wrap:break-word;word-wrap:break-word;word-break:break-word;background-color:transparent"class=block-grid><div style=border-collapse:collapse;display:table;width:100%><!--[if (mso)|(IE)]><table width=100% cellpadding=0 cellspacing=0 border=0><tr><td style=background-color:transparent align=center><table cellpadding=0 cellspacing=0 border=0 style=width:500px><tr class=layout-full-width style=background-color:transparent><![endif]--><!--[if (mso)|(IE)]><td align=center width=500 style="width:500px;padding-right:0;padding-left:0;padding-top:5px;padding-bottom:5px;border-top:0 solid transparent;border-left:0 solid transparent;border-bottom:0 solid transparent;border-right:0 solid transparent"valign=top><![endif]--><div style="min-width:320px;max-width:500px;width:500px;width:calc(18000% - 89500px);background-color:transparent"class="col num12"><div style=background-color:transparent;width:100%!important><!--[if (!mso)&(!IE)]><!--><div style="border-top:0 solid transparent;border-left:0 solid transparent;border-bottom:0 solid transparent;border-right:0 solid transparent;padding-top:5px;padding-bottom:5px;padding-right:0;padding-left:0"><!--<![endif]--><!--[if mso]><table width=100% cellpadding=0 cellspacing=0 border=0><tr><td style=padding-right:10px;padding-left:10px;padding-top:10px;padding-bottom:10px><![endif]--><div style=color:#555;line-height:120%;font-family:Roboto,Tahoma,Verdana,Segoe,sans-serif;padding-right:10px;padding-left:10px;padding-top:10px;padding-bottom:10px><div style=font-size:12px;line-height:14px;font-family:Roboto,Tahoma,Verdana,Segoe,sans-serif;color:#555;text-align:left><p style=margin:0;font-size:12px;line-height:14px><span style=font-size:14px;line-height:16px>` + recipientUserObject.name + `:</span><p style=margin:0;font-size:12px;line-height:14px> <br><p style=margin:0;font-size:12px;line-height:14px><span style=font-size:14px;line-height:16px>Your request to post the announcement titled "` + deniedAnnouncementObject.title + `" cannot be posted in its current form.</span><p style=margin:0;font-size:12px;line-height:14px> <br><p style=margin:0;font-size:12px;line-height:14px><span style=font-size:14px;line-height:16px><b>Title:</b> ` + deniedAnnouncementObject.title + `</span><p style=margin:0;font-size:12px;line-height:14px><span style=font-size:14px;line-height:16px><b>Description:</b> ` + deniedAnnouncementObject.description + `</span><p style=margin:0;font-size:12px;line-height:14px><span style=font-size:14px;line-height:16px><b>Reason:</b> ` + (rejectionReason ? rejectionReason : "(no reason for rejection provided)") + `</span><p style=margin:0;font-size:12px;line-height:14px> <br><p style=margin:0;font-size:12px;line-height:14px><span style=font-size:14px;line-height:16px>The reasons for denial may include:</span><p style=margin:0;font-size:12px;line-height:14px><span style=font-size:14px;line-height:16px><br data-mce-bogus=1></span><ol><li style=font-size:12px;line-height:14px><span style=font-size:14px;line-height:16px>Incomplete information - All event announcements must include time, date, and location.</span><li style=font-size:12px;line-height:14px><span style=font-size:14px;line-height:16px>Inappropriate language - Please use language that is representative of La Cañada High School including the use of proper grammar and syntax.</span><li style=font-size:12px;line-height:14px><span style=font-size:14px;line-height:16px>Length - The announcement is too lengthy of this platform.</span><li style=font-size:12px;line-height:14px><span style=font-size:14px;line-height:16px>Inappropriate Topic -- All announcements must be related to school events.</span><li style=font-size:12px;line-height:14px><span style=font-size:14px;line-height:16px>Violation of school rules - A portion or all of your announcement may include the information that conflicts with the established school rules or policies.</span></ol><p style=margin:0;font-size:12px;line-height:14px><span style=font-size:14px;line-height:16px></span><span style=font-size:14px;line-height:16px><br></span><p style=margin:0;font-size:12px;line-height:14px><span style=font-size:14px;line-height:16px>Please check your announcement carefully and resubmit your announcement. We look forward to approving your new submission.Thank you for using Spartan Connect.</span><p style=margin:0;font-size:12px;line-height:14px> <br><p style=margin:0;font-size:12px;line-height:14px><span style=font-size:14px;line-height:16px>La Cañada Administration Team</span></div></div><!--[if mso]><![endif]--><div style=padding-right:10px;padding-left:10px;padding-top:10px;padding-bottom:10px class="center button-container"align=center><!--[if mso]><table width=100% cellpadding=0 cellspacing=0 border=0 style=border-spacing:0;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0><tr><td style=padding-right:10px;padding-left:10px;padding-top:10px;padding-bottom:10px align=center><v:roundrect xmlns:v=urn:schemas-microsoft-com:vml xmlns:w=urn:schemas-microsoft-com:office:word href=connect.lchsspartans.net/me style=height:34px;v-text-anchor:middle;width:155px arcsize=12% strokecolor=#B32020 fillcolor=#B32020><w:anchorlock><center style=color:#fff;font-family:Roboto,Tahoma,Verdana,Segoe,sans-serif;font-size:14px><![endif]--><a href=connect.lchsspartans.net/me style="display:inline-block;text-decoration:none;-webkit-text-size-adjust:none;text-align:center;color:#fff;background-color:#b32020;border-radius:4px;-webkit-border-radius:4px;-moz-border-radius:4px;max-width:135px;width:95px;width:auto;border-top:0 solid transparent;border-right:0 solid transparent;border-bottom:0 solid transparent;border-left:0 solid transparent;padding-top:5px;padding-right:20px;padding-bottom:5px;padding-left:20px;font-family:Roboto,Tahoma,Verdana,Segoe,sans-serif;mso-border-alt:none"target=_blank><span style=font-size:12px;line-height:24px>Go to User Panel</span></a><!--[if mso]><![endif]--></div><!--[if (!mso)&(!IE)]><!--></div><!--<![endif]--></div></div><!--[if (mso)|(IE)]><![endif]--></div></div></div><div style=background-color:#e5e5e5><div style="Margin:0 auto;min-width:320px;max-width:500px;width:500px;width:calc(19000% - 98300px);overflow-wrap:break-word;word-wrap:break-word;word-break:break-word;background-color:transparent"class=block-grid><div style=border-collapse:collapse;display:table;width:100%><!--[if (mso)|(IE)]><table width=100% cellpadding=0 cellspacing=0 border=0><tr><td style=background-color:#e5e5e5 align=center><table cellpadding=0 cellspacing=0 border=0 style=width:500px><tr class=layout-full-width style=background-color:transparent><![endif]--><!--[if (mso)|(IE)]><td align=center width=500 style="width:500px;padding-right:0;padding-left:0;padding-top:5px;padding-bottom:5px;border-top:0 solid transparent;border-left:0 solid transparent;border-bottom:0 solid transparent;border-right:0 solid transparent"valign=top><![endif]--><div style="min-width:320px;max-width:500px;width:500px;width:calc(18000% - 89500px);background-color:transparent"class="col num12"><div style=background-color:transparent;width:100%!important><!--[if (!mso)&(!IE)]><!--><div style="border-top:0 solid transparent;border-left:0 solid transparent;border-bottom:0 solid transparent;border-right:0 solid transparent;padding-top:5px;padding-bottom:5px;padding-right:0;padding-left:0"><!--<![endif]--><!--[if mso]><table width=100% cellpadding=0 cellspacing=0 border=0><tr><td style=padding-right:10px;padding-left:10px;padding-top:10px;padding-bottom:10px><![endif]--><div style=color:#555;line-height:120%;font-family:Roboto,Tahoma,Verdana,Segoe,sans-serif;padding-right:10px;padding-left:10px;padding-top:10px;padding-bottom:10px><div style=font-family:Roboto,Tahoma,Verdana,Segoe,sans-serif;font-size:12px;line-height:14px;color:#555;text-align:left><p style=margin:0;font-size:12px;line-height:14px>Copyright © 2017 Spartan Connect Dev Team<br><p style=margin:0;font-size:12px;line-height:14px><span style=font-size:10px;line-height:12px>You are receiving this email because you have signed up on our service.</span></div></div><!--[if mso]><![endif]--><!--[if (!mso)&(!IE)]><!--></div><!--<![endif]--></div></div><!--[if (mso)|(IE)]><![endif]--></div></div></div><!--[if (mso)|(IE)]><![endif]--></div><!--[if (mso)|(IE)]><![endif]-->`;
}

/**
 * A function that returns a plaintext email message to be encoded and sent to the recipient.
 * @param {Object} adminUserObject The user object for the admin to which the message is being sent.
 * @param {Object[]} pendingAnnouncementArray An array of announcement objects which have at least a title and description member.
 * @return A **unencoded** string that is sent to the admin who needs to approve them.
 */
function generatePendingMessage(pendingAnnouncementArray, adminUserObject) {
    /* eslint-disable spellcheck/spell-checker, quotes */
    let message = 'Date: ' + new Date().toUTCString() + '\nFrom: Spartan Connect <studentdevteam@mylcusd.net>\nTo: ' + adminUserObject.name + ' <' + adminUserObject.email + '>' + '\nSubject: Spartan Connect Pending Announcements\nContent-Type: text/html; charset=UTF-8\n\n' + `<!DOCTYPE html><html><head> <!--[if gte mso 9]><xml> <o:OfficeDocumentSettings> <o:AllowPNG/> <o:PixelsPerInch>96</o:PixelsPerInch> </o:OfficeDocumentSettings> </xml><![endif]--><meta content="text/html; charset=utf-8" http-equiv="Content-Type"><meta content="width=device-width" name="viewport"><!--[if !mso]><!--><meta content="IE=edge" http-equiv="X-UA-Compatible"><!--<![endif]--><title></title><!--[if !mso]><!== --><link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet" type="text/css"><!--<![endif]--><style id="media-query" type="text/css">body{margin:0;padding:0}table,tr,td{vertical-align:top;border-collapse:collapse}.ie-browser table, .mso-container table{table-layout:fixed}*{line-height:inherit}a[x-apple-data-detectors=true]{color:inherit !important;text-decoration:none !important}[owa] .img-container div, [owa] .img-container button{display:block !important}[owa] .fullwidth button{width:100% !important}[owa] .block-grid .col{display:table-cell;float:none !important;vertical-align:top}.ie-browser .num12, .ie-browser .block-grid, [owa] .num12, [owa] .block-grid{width:500px !important}.ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div{line-height:100%}.ie-browser .mixed-two-up .num4, [owa] .mixed-two-up .num4{width:164px !important}.ie-browser .mixed-two-up .num8, [owa] .mixed-two-up .num8{width:328px !important}.ie-browser .block-grid.two-up .col, [owa] .block-grid.two-up .col{width:250px !important}.ie-browser .block-grid.three-up .col, [owa] .block-grid.three-up .col{width:166px !important}.ie-browser .block-grid.four-up .col, [owa] .block-grid.four-up .col{width:125px !important}.ie-browser .block-grid.five-up .col, [owa] .block-grid.five-up .col{width:100px !important}.ie-browser .block-grid.six-up .col, [owa] .block-grid.six-up .col{width:83px !important}.ie-browser .block-grid.seven-up .col, [owa] .block-grid.seven-up .col{width:71px !important}.ie-browser .block-grid.eight-up .col, [owa] .block-grid.eight-up .col{width:62px !important}.ie-browser .block-grid.nine-up .col, [owa] .block-grid.nine-up .col{width:55px !important}.ie-browser .block-grid.ten-up .col, [owa] .block-grid.ten-up .col{width:50px !important}.ie-browser .block-grid.eleven-up .col, [owa] .block-grid.eleven-up .col{width:45px !important}.ie-browser .block-grid.twelve-up .col, [owa] .block-grid.twelve-up .col{width:41px !important}@media only screen and (min-width: 520px){.block-grid{width:500px !important}.block-grid .col{display:table-cell;Float:none !important;vertical-align:top}.block-grid .col.num12{width:500px !important}.block-grid.mixed-two-up .col.num4{width:164px !important}.block-grid.mixed-two-up .col.num8{width:328px !important}.block-grid.two-up .col{width:250px !important}.block-grid.three-up .col{width:166px !important}.block-grid.four-up .col{width:125px !important}.block-grid.five-up .col{width:100px !important}.block-grid.six-up .col{width:83px !important}.block-grid.seven-up .col{width:71px !important}.block-grid.eight-up .col{width:62px !important}.block-grid.nine-up .col{width:55px !important}.block-grid.ten-up .col{width:50px !important}.block-grid.eleven-up .col{width:45px !important}.block-grid.twelve-up .col{width:41px !important}}@media (max-width: 520px){.block-grid,.col{min-width:320px !important;max-width:100% !important}.block-grid{width:calc(100% - 40px) !important}.col{width:100% !important}.col>div{margin:0 auto}img.fullwidth{max-width:100% !important}}</style></head><body class="clean-body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #FFFFFF"> <!--[if IE]><div class="ie-browser"><![endif]--><!--[if mso]><div class="mso-container"><![endif]--><div class="nl-container" style="min-width: 320px;Margin: 0 auto;background-color: #FFFFFF"> <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #FFFFFF;"><![endif]--><div style="background-color:transparent;"><div class="block-grid" style="Margin: 0 auto;min-width: 320px;max-width: 500px;width: 500px;width: calc(19000% - 98300px);overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;"><div style="border-collapse: collapse;display: table;width: 100%;"> <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="background-color:transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width: 500px;"><tr class="layout-full-width" style="background-color:transparent;"><![endif]--><!--[if (mso)|(IE)]><td align="center" width="500" style=" width:500px; padding-right: 0px; padding-left: 0px; padding-top:5px; padding-bottom:5px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><![endif]--><div class="col num12" style="min-width: 320px;max-width: 500px;width: 500px;width: calc(18000% - 89500px);background-color: transparent;"><div style="background-color: transparent; width: 100% !important;"> <!--[if (!mso)&(!IE)]><!--><div style="border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;"> <!--<![endif]--><div align="center" class="img-container center fullwidth" style="padding-right: 0px; padding-left: 0px;"> <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px;" align="center"><![endif]--><img align="center" alt="Image" border="0" class="center fullwidth" src="https://connect.lchsspartans.net/assets/sc_banner.png" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: 0;height: auto;float: none;width: 100%;max-width: 500px" title="Image" width="500"><!--[if mso]></td></tr></table><![endif]--></div><!--[if (!mso)&(!IE)]><!--></div><!--<![endif]--></div></div><!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]--></div></div></div><div style="background-color:transparent;"><div class="block-grid" style="Margin: 0 auto;min-width: 320px;max-width: 500px;width: 500px;width: calc(19000% - 98300px);overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;"><div style="border-collapse: collapse;display: table;width: 100%;"> <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="background-color:transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width: 500px;"><tr class="layout-full-width" style="background-color:transparent;"><![endif]--><!--[if (mso)|(IE)]><td align="center" width="500" style=" width:500px; padding-right: 0px; padding-left: 0px; padding-top:5px; padding-bottom:5px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><![endif]--><div class="col num12" style="min-width: 320px;max-width: 500px;width: 500px;width: calc(18000% - 89500px);background-color: transparent;"><div style="background-color: transparent; width: 100% !important;"> <!--[if (!mso)&(!IE)]><!--><div style="border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;"> <!--<![endif]--><!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 10px; padding-left: 10px; padding-top: 10px; padding-bottom: 10px;"><![endif]--><div style="color:#555555;line-height:120%;font-family:'Roboto', Tahoma, Verdana, Segoe, sans-serif; padding-right: 10px; padding-left: 10px; padding-top: 10px; padding-bottom: 10px;"><div style="font-size:12px;line-height:14px;font-family:'Roboto',Tahoma,Verdana,Segoe,sans-serif;color:#555555;text-align:left;"><p style="margin: 0;font-size: 12px;line-height: 14px"><span style="font-size: 14px; line-height: 16px;">Hello,</span></p><p style="margin: 0;font-size: 12px;line-height: 14px">&#160;<br></p><p style="margin: 0;font-size: 12px;line-height: 14px"><span style="font-size: 14px; line-height: 16px;">There ` + (pendingAnnouncementArray.length == 1 ? "is a" : "are") + ` pending announcement` + (pendingAnnouncementArray.length == 1 ? "" : "s") + ` that require your attention. ` + (pendingAnnouncementArray.length == 1 ? "Its" : "Their") + ` title` + (pendingAnnouncementArray.length == 1 ? "" : "s") + ` and description` + (pendingAnnouncementArray.length == 1 ? "" : "s") + ` ` + (pendingAnnouncementArray.length == 1 ? "is" : "are") + ` below:</span></p><p style="margin: 0;font-size: 12px;line-height: 14px">&#160;<br></p><table cellspacing="0" cellpadding="10" border="1"><tr><th width="120">Title</th><th width="360">Description</th></tr>`;
    for(let i = 0; i < pendingAnnouncementArray.length; i++) {
        message += `<tr><td width="120">` + pendingAnnouncementArray[i].title + `</td><td width="360">` + pendingAnnouncementArray[i].description + `</td></tr>`;
    }
    message += `</table><p style="margin: 0;font-size: 12px;line-height: 14px">&#160;<br></p><p style="margin: 0;font-size: 12px;line-height: 14px"><span style="font-size: 14px; line-height: 16px;">La Cañada Student Development Team</span></p></div></div><!--[if mso]></td></tr></table><![endif]--><div align="center" class="button-container center" style="padding-right: 10px; padding-left: 10px; padding-top:10px; padding-bottom:10px;"> <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-spacing: 0; border-collapse: collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;"><tr><td style="padding-right: 10px; padding-left: 10px; padding-top:10px; padding-bottom:10px;" align="center"><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="connect.lchsspartans.net/me" style="height:34px; v-text-anchor:middle; width:155px;" arcsize="12%" strokecolor="#B32020" fillcolor="#B32020"><w:anchorlock/><center style="color:#ffffff; font-family:'Roboto', Tahoma, Verdana, Segoe, sans-serif; font-size:14px;"><![endif]--><a href="connect.lchsspartans.net/admin" style="display: inline-block;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #ffffff; background-color: #B32020; border-radius: 4px; -webkit-border-radius: 4px; -moz-border-radius: 4px; max-width: 135px; width: 95px; width: auto; border-top: 0px solid transparent; border-right: 0px solid transparent; border-bottom: 0px solid transparent; border-left: 0px solid transparent; padding-top: 5px; padding-right: 20px; padding-bottom: 5px; padding-left: 20px; font-family: 'Roboto', Tahoma, Verdana, Segoe, sans-serif;mso-border-alt: none" target="_blank"><span style="font-size:12px;line-height:24px;">Go to Admin Panel</span></a> <!--[if mso]></center></v:roundrect></td></tr></table><![endif]--></div><!--[if (!mso)&(!IE)]><!--></div><!--<![endif]--></div></div><!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]--></div></div></div><div style="background-color:#E5E5E5;"><div class="block-grid" style="Margin: 0 auto;min-width: 320px;max-width: 500px;width: 500px;width: calc(19000% - 98300px);overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;"><div style="border-collapse: collapse;display: table;width: 100%;"> <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="background-color:#E5E5E5;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width: 500px;"><tr class="layout-full-width" style="background-color:transparent;"><![endif]--><!--[if (mso)|(IE)]><td align="center" width="500" style=" width:500px; padding-right: 0px; padding-left: 0px; padding-top:5px; padding-bottom:5px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><![endif]--><div class="col num12" style="min-width: 320px;max-width: 500px;width: 500px;width: calc(18000% - 89500px);background-color: transparent;"><div style="background-color: transparent; width: 100% !important;"> <!--[if (!mso)&(!IE)]><!--><div style="border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;"> <!--<![endif]--><!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 10px; padding-left: 10px; padding-top: 10px; padding-bottom: 10px;"><![endif]--><div style="color:#555555;line-height:120%;font-family:'Roboto', Tahoma, Verdana, Segoe, sans-serif; padding-right: 10px; padding-left: 10px; padding-top: 10px; padding-bottom: 10px;"><div style="font-family:'Roboto',Tahoma,Verdana,Segoe,sans-serif;font-size:12px;line-height:14px;color:#555555;text-align:left;"><p style="margin: 0;font-size: 12px;line-height: 14px">Copyright © 2017 Spartan Connect Dev Team<br></p><p style="margin: 0;font-size: 12px;line-height: 14px"><span style="font-size: 10px; line-height: 12px;">You are receiving this email because you have signed up on our service.</span></p></div></div><!--[if mso]></td></tr></table><![endif]--><!--[if (!mso)&(!IE)]><!--></div><!--<![endif]--></div></div><!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]--></div></div></div><!--[if (mso)|(IE)]></td></tr></table><![endif]--></div><!--[if (mso)|(IE)]></div><![endif]--></body></html>`;
    /* eslint-enable spellcheck/spell-checker, quotes */
    return message;
}

exports.sendDenialEmail = function (announcementId, rejectionReason) {
    return new Promise ((resolve) => {
        fs.readFile('client_secret.json', function processClientSecrets(err, content) {
            if (err) {
                console.log('Error loading client secret file: ' + err);
                return;
            }
            // Authorize a client with the loaded credentials, then call the
            // Gmail API.
            authorize(JSON.parse(content), (auth) => {
                announcementUtilities.getAnnouncementById(announcementId).then((deniedAnnouncementObject) => {
                    var gmail = google.gmail('v1');
                    var request = gmail.users.messages.send({
                        auth: auth,
                        userId: 'me',
                        resource: {
                            raw: Base64.encodeURI(generateDenialMessage(deniedAnnouncementObject[0], deniedAnnouncementObject[0].creator, rejectionReason))
                        }
                    }, () => {
                        resolve(true);
                    });
                });
            });
        });
    });
};

exports.sendPendingEmail = function (pendingAnnouncementArray, adminUserObject) {
    return new Promise ((resolve) => {
        fs.readFile('client_secret.json', function processClientSecrets(err, content) {
            if (err) {
                console.log('Error loading client secret file: ' + err);
                return;
            }
            // Authorize a client with the loaded credentials, then call the
            // Gmail API.
            authorize(JSON.parse(content), (auth) => {
                var gmail = google.gmail('v1');
                var request = gmail.users.messages.send({
                    auth: auth,
                    userId: 'me',
                    resource: {
                        raw: Base64.encodeURI(generatePendingMessage(pendingAnnouncementArray, adminUserObject))
                    }
                }, () => {
                    resolve(true);
                });
            });
        });
    }); 
};

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function (err, token) {
        if (err) {
            getNewToken(oauth2Client, callback);
        } else {
            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client);
        }
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline', //eslint-disable-line camelcase
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function (code) {
        rl.close();
        oauth2Client.getToken(code, function (err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            callback(oauth2Client);
        });
    });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code != 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
}

module.exports = exports; 