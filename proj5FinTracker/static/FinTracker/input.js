document.addEventListener('DOMContentLoaded', function() {	
	var inputForm = document.querySelector('#input-form-button');
	inputForm.addEventListener('submit',scanDocument());			
});

/*requests user to classify transactions retrieved via csv document*/
function scanDocument() {
	
	var index = 0;
	var dmpvar = document.querySelector('#unfound'); //a transaction that does match transactions in dbmatches nothing in db -> need to categorize	
	try {
		var transacts = JSON.parse(dmpvar.value);
	}
	catch(err) {
		//will error on first load
		return;
	}
	if (typeof transacts != 'undefined')
	{		
		while (transacts[index]) {
			var afterDateAmtPattern = /[^\s\.\d-\(\d,\)]+.+/; 
			var datePattern = /\d{4}-\d{2}-\d{2}/;				//  -- 0000-00-00
			var amtPattern = /-?[\d+,?]*\d+\.\d{2}/;			//  -- 000.00
			var tdate = transacts[index].match(datePattern);
			var tamt = transacts[index].match(amtPattern);			
			var desc = transacts[index].match(afterDateAmtPattern);			
			var ocat = getCategory(transacts[index++]);
			//console.log(`date: ${tdate}`);
			fetch('vupdateEntry', {
				method: 'POST',
				body:	JSON.stringify({
					ddate : tdate[0],
					damt : tamt[0],
					ddescription : desc[0],
					dcat : ocat[0],
					dgroup: ocat[1]
				})
			})
			.then(response => response.json())
			.then(result => {
				//console.log(result['msg4']);
				//console.log(result.msg);
			})
			.catch(error => {
				console.log('tError:', error);  
			});	
		}//end while
	}
}

function getCategory(entry) {
  var cat = prompt("Please provide the category of this entry:\n" + entry);
  var group = prompt("group for \n" + entry);  
  return [cat, group];
}