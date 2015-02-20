<?php
$ClientID="Top1KVocab";
$ClientSecret="YK84Qyaz6llSlCHEOIeY5KyUYzwpO8p6m8SUUCveO3o=";

$ClientSecret = urlencode ($ClientSecret);
$ClientID = urlencode($ClientID);

// Get a 10-minute access token for Microsoft Translator API.
$url = "https://datamarket.accesscontrol.windows.net/v2/OAuth2-13";
$postParams = "grant_type=client_credentials&client_id=$ClientID&client_secret=$ClientSecret&scope=http://api.microsofttranslator.com";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url); 
curl_setopt($ch, CURLOPT_POSTFIELDS, $postParams);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);  
$rsp = curl_exec($ch); 

//print $rsp;
// Get a 10-minute access token for Microsoft Translator API.
$speakUrl = "http://api.microsofttranslator.com/V2/Ajax.svc/Speak";
$speakPostParams = "text=testing&language=en&format=audio/mp3&appId=$rsp";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $speakUrl); 
curl_setopt($ch, CURLOPT_POSTFIELDS, $speakPostParams);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);  
$speakRsp = curl_exec($ch); 

echo $rsp;
echo $speakPostParams;
print $speakRsp;
?>
