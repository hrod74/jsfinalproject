/* javascript goes here  */
/*
I want to make an API call to display a bible verse of the day
I want the user to be able to create a username for their prayer request
I want the user to have a text box to enter the prayer request
I want the user to be able to submit the username & prayer request and store that data on firebase
I want to be able to display the prayer request & username once the hit submit
I want the user to be able to click a icon to vote/pickup a prayer

*/
/*----------------------------------------------------------------------------*/
/*--- defining database credentials ...                                    ---*/
/*----------------------------------------------------------------------------*/
var config  =  {  apiKey         : "",
                  databaseURL    : "",
                  storageBucket  : ""
               };

/*----------------------------------------------------------------------------*/
/*--- load data,                                                           ---*/
/*--- generate content (in tr) from data,                                  ---*/
/*--- keep data reference (in data)                                        ---*/
/*----------------------------------------------------------------------------*/
var data    =  {};
firebase.initializeApp( config );
var conn = firebase.database().ref('prayers/');
conn.on("child_added", function(snapshot) {
   //--- capture record ---
   var prayer         = snapshot.val();

   //--- store record reference (in data) for future updates ---
   data[snapshot.key] = prayer;

   //--- generate row content ---
   var tr      = "<tr>";
       tr     +=     "<td>" + prayer.date    + "</td>";
       tr     +=     "<td>" + prayer.user    + "</td>";
       tr     +=     "<td>" + prayer.prayer  + "</td>";
       tr     +=     "<td>";
       tr     +=        "<ul class='nav nav-pills'>";
       tr     +=           "<li>";
       //--- assign snapshot.key to each thumb so on click we know which record to update
       tr     +=              "<i onClick='vote(\"" + snapshot.key + "\");' class='fa fa-thumbs-up thumb' aria-hidden='true'></i>";
       tr     +=              "<span id='"+snapshot.key+"' class='badge'>" + prayer.votes + "</span>";
       tr     +=           "</li>";
       tr     +=        "</ul>";
       tr     +=     "</td>";
       tr     += "</tr>";

   //--- render row content ---
   $("#prayer-list").prepend( tr );
});

/*----------------------------------------------------------------------------*/
/*--- document ready ...                                                   ---*/
/*----------------------------------------------------------------------------*/
$(document).ready( function () {
   //--- call verse of the day and display on bottom ---
   bibleApiCall();

   //--- Capture click on submit button ---
   $("#submitprayer" ).on('click', function(){
      //--- strip blank spaces from input values, usefuf to validate empty values ---
      $( "#inputUser"   ).val( $.trim($( "#inputUser"   ).val()) );
      $( "#inputPrayer" ).val( $.trim($( "#inputPrayer" ).val()) );

      //--- capture values values ---
      var inputUser     = $( "#inputUser"   ).val();
      var inputPrayer   = $( "#inputPrayer" ).val();

      //--- clean errors (in case previously failed) ---
      $( "#inputUser"   ).removeClass( "inputError" );
      $( "#inputPrayer" ).removeClass( "inputError" );

      //--- validate empty values ---
      if( inputUser=="" )
         $( "#inputUser"   ).addClass( "inputError" );
      if( inputPrayer=="" )
         $( "#inputPrayer"   ).addClass( "inputError" );

      //--- if passed validation, save and clean values (set to blank) ---
      if( inputUser!="" && inputPrayer!="" )
      {
           save();
           $( "#inputUser"   ).val("");
           $( "#inputPrayer" ).val("");
      }

      //--- prevent buttons from submitting form since its done via code ---
      event.preventDefault();
   });


   //--- capture click on cancel button ---
   $("#cancelprayer").click( function() {
      //--- clean errors (in case previously failed) ---
      $( "#inputUser"   ).removeClass( "inputError" );
      $( "#inputPrayer" ).removeClass( "inputError" );

      //--- empty values ---
      $( "#inputUser"   ).val("");
      $( "#inputPrayer" ).val("");

      //--- prevent buttons from submitting form since its done via code ---
      event.preventDefault();
   });

})

/*----------------------------------------------------------------------------*/
/*--- save ...                                                             ---*/
/*----------------------------------------------------------------------------*/
function save( date, user, prayer, votes )
{
  var user    = $('#inputUser'  ).val();
  var prayer  = $('#inputPrayer').val();
  conn.push( { date    :  today(),
               user    :  user,
               prayer  :  prayer,
               votes   :  0
           });
}

/*----------------------------------------------------------------------------*/
/*--- verse of the day API call ...                                        ---*/
/*----------------------------------------------------------------------------*/
function bibleApiCall()
{
   var link = "https://labs.bible.org/api/?passage=votd&type=json";
   $.ajax( {   url         :  link,
               method      :  'GET',
               crossDomain :  true,
               dataType    :  'jsonp',
               success     :  function( r ) {
                  var   bookname = r[0].bookname;
                  var   chapter  = r[0].chapter;
                  var   verse    = r[0].verse;
                  var   text     = r[0].text;
                  var   content  = "<legend>Verse Of The Day</legend>";
                        content +=    "<blockquote>";
                        content +=    "<p id='bible'>" + text + "</p>";
                        content +=    "<small>" + bookname + " " + chapter + ":" + verse + "<cite title='Source Title'>NIV</cite></small>";
                        content += "</blockquote>";
                  $("#randomVerse").html( content );
               },
            error          : function( error ){
               alert("opps something went wrong!")
            }
         });
}

/*----------------------------------------------------------------------------*/
/*--- today ...                                                            ---*/
/*--- generate current date format mm/dd/yyyy                              ---*/
/*----------------------------------------------------------------------------*/
function today()
{
  var date          = new Date();
  var currentDate   = date.getDate();
  var month         = date.getMonth() + 1;
  var year          = date.getFullYear();
  return month + "/" + currentDate + "/" + year;
}

/*----------------------------------------------------------------------------*/
/*--- vote ...                                                             ---*/
/*----------------------------------------------------------------------------*/
function vote( snapshotKey )
{
   //--- locate record (by snapshotKey), alter record by incrementing vote by 1 ---
   data[snapshotKey].votes++;

   //--- save altered record ---
   conn.update(data);

   //--- alter visual content (html) with new value ---
   $("#"+snapshotKey).html( data[snapshotKey].votes );
}
