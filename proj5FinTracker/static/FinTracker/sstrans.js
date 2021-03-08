document.addEventListener('DOMContentLoaded', function() {
	
	//////////////////////////////////////////
	// load data and initialize display     //
	//////////////////////////////////////////	
	
	google.charts.load('current', {'packages':['corechart']});	
	google.setOnLoadCallback(loadTable);
		
	var findbyDateForm = document.querySelector('#search-bymonth-form');
	findbyDateForm.addEventListener('submit', findTransactionsByDate);
	
	var addTransDiv = document.querySelector("#add-trans");
	addTransDiv.style.display = 'none';
	
////console.log("domcontent loading");
	
	var addTransactionButton = document.querySelector('#add-trans-button');	
	addTransactionButton.addEventListener('click', () => showAddTransaction());
	
	var addTransactionForm = document.querySelector('#add-trans-form')
	addTransactionForm.addEventListener('submit', addTransaction);
	
	var navyearItem = document.querySelector('#navyear')
	navyearItem.addEventListener('click', loadYear);
	
	var epochItem = document.querySelector('#navepoch')
	epochItem.addEventListener('click', loadEpoch);
	
	var navmonth = document.querySelector('#navmonth');
	var nmclass = document.createAttribute('class');
	nmclass.value = `active`;
	navmonth.setAttributeNode(nmclass);	
	
	var chartViewBtn = document.querySelector("#chart-view-btn");
	chartViewBtn.addEventListener('click', changeChart);
	chartViewBtn.innerHTML = "Bar Graph";
	console.log(`load chrtview: ${chartViewBtn.innerHTML}`);
	
});//end addEventListener

const column = {
	CAT: 1,
	GRP: 2,
	MSG: 3	
};

const jperiod = {
	DAY:   1, 
	MONTH: 2, 
	YEAR:  3, 
	ALL:   4	 // user's epoch
};

const chartType = {
	PIE: 1,
	BAR: 2
}

function getTextMonth(month_ord) {
    
    months =   ["January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December"]
    return months[month_ord - 1]   
}

function inYearView() {
	
	var viewButton = document.querySelector('#navyear');
	var val = viewButton.getAttribute('class');	
	return !!val;
}

function inEpochView() {
	
	var viewButton = document.querySelector('#navepoch');
	var val = viewButton.getAttribute('class');	
	return !!val;
}

function loadYear() {
	
	if (inYearView())
		return 0;
	
	clearAllCharts();
	var cvbtn = document.querySelector('#chart-view-btn');
	cvbtn.innerHTML = "Bar Graph";
		
	let rgex = /\d\d\d\d/;
	var displayDate = document.querySelector('#date-span');
	var dd = displayDate.innerHTML;
	yr = dd.substring(dd.search(rgex));
	
	setNavBar(document.querySelector('#navyear'));	
	loadTable(yr.concat("/11/11"),jperiod.YEAR);
	displayDate.innerHTML = yr;
	
	document.querySelector('#add-form-group').style.display = 'none';
	
/////console.log(`inner.value: ${displayDate.innerHTML.value}, diplayDate.ivalue: ${displayDate.value}`);
}

function loadEpoch() {	

	if (inEpochView())
		return 0;
	
	document.querySelector('#navyear').style.display = 'none';	
	clearAllCharts();
	var cvbtn = document.querySelector('#chart-view-btn');
	cvbtn.innerHTML = "Bar Graph";	
	setNavBar(document.querySelector('#navepoch'));
	
	loadTable(0,jperiod.ALL);
	document.querySelector('#add-form-group').style.display = 'none';	
	document.querySelector('#findby-form').style.display = 'none';	
}

function loadTable(pdate = 0, period = jperiod.MONTH, ctype = chartType.PIE) {
	
	console.log(`loadTable ctype before ${ctype} period: ${period}`);
	if (isNaN(ctype))
		ctype = chartType.PIE;
	
	console.log(`loadTable ctype after ${ctype} period: ${period}`);
	//document.querySelector('#target').innerHTML = "";
	fetch('jsvmonth', {
		method: 'POST',
		body: JSON.stringify({
			jsdate: pdate,
			jstype: period
		})			
	})
	.then(response => response.json())
	.then(transactions => {
		//console.log('loading table then statements...');
		//console.log(transactions);
		transactions.forEach(displayTrans);		
		createChart(transactions, ctype);
		var displayDate = document.querySelector('#date-span');
		if (period == jperiod.YEAR) {			
			displayDate.innerHTML = `All ${pdate.slice(0,4)} transactions`;
		}
		else if (period == jperiod.ALL) {
			displayDate.innerHTML = `All Transactions`;			
		}
		else
			displayDataDate(pdate);
	});	
	var grpHeading = document.querySelector('#cat-grp');
	grpHeading.style.display = 'none';	
}

function clearAllCharts() {
	//clear current views: table, summary table, pie chart
	transTable = document.querySelector('#target');
	transTable.innerHTML = "";
	debitTable = document.querySelector('#debit-overview');
	debitTable.innerHTML = "";
	debitPie = document.querySelector('#debit-pie');
	debitPie.innerHTML = "";
	creditTable = document.querySelector('#credit-overview');
	creditTable.innerHTML = "";
	creditPie = document.querySelector('#credit-pie');
	creditPie.innerHTML = "";
}

function setNavBar(navitem) {
	document.querySelector('#navmonth').removeAttribute("class");
	document.querySelector('#navyear').removeAttribute("class");
		
	var nyclass = document.createAttribute('class');
	nyclass.value = `active`;
	navitem.setAttributeNode(nyclass);	
}

function showAddTransaction() {
	var addTransDiv = document.querySelector("#add-trans");
	var addTransButton  = document.querySelector('#add-trans-button');
	var saveTram = document.querySelector('#add-btn');
	var saveForm = document.querySelector('#add-trans-form');
	
	if(addTransDiv.style.display == 'none')
		addTransDiv.style.display = 'block';		
	else 
		addTransDiv.style.display = 'none';
}

function addTransaction(event) {
	event.preventDefault();
	fetch('jsvsave', {
		method: 'POST',
		body: JSON.stringify({
			trans_date: document.querySelector('#dte').value,
			trans_amt: document.querySelector('#amt').value,
			trans_msg: document.querySelector('#msg').value,
			trans_category: document.querySelector('#cat').value,
			trans_group: document.querySelector('#grp').value,
		})
	})
	.then(response => response.json())
	.then(msg => {
		//reset state of add transaction form
		showAddTransaction();
		//clear current transaction that are displayed
		var tableContents = document.querySelector('#target');		
		tableContents.innerHTML = '';
		
		tdate = document.querySelector('#dte').value;
		console.log(`tdate in addTransaction function: ${tdate}`);
		
		//on return, display month view and pie chart regardless of previous view
		loadTable(tdate, jperiod.MONTH);
		var navmonth = document.querySelector('#navmonth');
		var nmclass = document.createAttribute('class');
		nmclass.value = `active`;
		navmonth.setAttributeNode(nmclass);	
		var chartViewBtn = document.querySelector("#chart-view-btn");
		chartViewBtn.innerHTML = "Bar Graph";
	});
}	

function displayDataDate (dateValue) {
	//get date from text box - we are doing a search by date
	//console.log("displayDataDate");
	if (!dateValue) {
		dateValue = document.querySelector("#bydate").value;
		//console.log("in first check");
	}
	//console.log(dateValue);
	var yyyy = 0;
	var mm = 0;
	//nothing passed in, nothing in text box, we are just doing a default date (today)
	if (!dateValue) {
		var today = new Date();
		mm = ((today.getMonth() + 1) < 10) ? "0" + (today.getMonth() + 1) : today.getMonth() + 1; //January is 0 
		yyyy = today.getFullYear();
		//console.log("in 2nd check");
		//console.log(`mm: ${mm}, yyyy: ${yyyy}`);
		dateValue = "" + yyyy + "-" + mm;
	}
	else {
		mm = dateValue.slice(5,7);
		yyyy = dateValue.substr(0,4)
	}
	//console.log(`datevalue: ${dateValue}`);
	var ds = document.querySelector('#date-span');
	
	//console.log(`(displaydate function) month section ${mm}`);
	monthText = getTextMonth(mm);
	
	dsDate = (inYearView()) ? `All ${yyyy} transactions` : (inEpochView()) ? "Since the beginning of Time" : `${monthText} ${yyyy}`;
	//console.log(`dsDate is: ${dsDate}`);
	ds.innerHTML = dsDate;
	console.log(`end: ${dateValue}`);
}

function findTransactionsByDate(event) {
	event.preventDefault();

	dateElem = document.querySelector('#bydate');
	var dateValue = dateElem.value;
	if (!dateValue) {
		dateValue = 0;
	}
	console.log(`findTransByDate... date is: ${dateValue}`);
	displayDataDate(dateValue);
	var tranCount = 0;
	
	let currtype = (inYearView()) ? jperiod.YEAR : (inEpochView()) ? jperiod.ALL : jperiod.MONTH;
	console.log(`currtype is : ${currtype}, dateVaule is ${dateValue}`);
	fetch('jsvmonth', {
		method: 'POST',
		body: JSON.stringify({
			jsdate: dateValue,
			jstype: currtype			
		})
	})
	.then(response => response.json())
	.then(transactions => {
		var transRows = document.querySelector('#target');
		transRows.innerHTML = "";
		transactions.forEach(displayTrans)
		if (currtype == jperiod.MONTH)
			createChart(transactions);
		else
			createCatbyMonthChart(transactions, currtype);
	});		
}

function deleteTran(tranID) {
	if (confirm('are you sure you want to delete transaction?'))
	{
		fetch('jsvdelete', {
			method: 'POST',
			body: JSON.stringify({
			jid: tranID			
			})
		})
		.then(response => response.json())
		.then(result => {
			
			var deletedRow = document.querySelector(`#row${tranID}`);
			deletedRow.remove();
			var tableContents = document.querySelector('#target');	
			tableContents.innerHTML = '';
			
			changeChart();
			
			//if val year button is active (i.e.val is not null) treat as year
			// if (inYearView()) {
				// yr = document.querySelector('#date-span').innerHTML.substring(4,8);
				// console.log(` yr is ${yr}`);
				// loadTable(yr.concat("/11/11"),jperiod.YEAR);
			// }
			// else {
				// //if we are looking at a view other than the default (i.e. this month)
				// var dateValue = document.querySelector("#bydate").value;
				// if (dateValue)
					// loadTable(dateValue, jperiod.MONTH);
				// else //default to today
					// loadTable();
			// }
		});		
	}	
}

function displayTrans(transaction) {
	
	var tr1 = document.createElement('tr');
	var trIDAttr = document.createAttribute('id');
	trIDAttr.value = `row${transaction['id']}`;
	tr1.setAttributeNode(trIDAttr);	
	const br = document.createElement('br');
	///////////////////edit column////////////////
	
	var td0 = document.createElement('td');
	var div0 = document.createElement('div');
	
	var editButton = document.createElement('button');
	editButton.innerHTML = "edit";
		
	var ecolumnIDAttr = document.createAttribute('id');
	ecolumnIDAttr.value = `editcolumn${transaction['id']}`;
	div0.setAttributeNode(ecolumnIDAttr);
	
	var ebuttonIDAttr = document.createAttribute('id');
	ebuttonIDAttr.value = `editbutton${transaction['id']}`;
	editButton.setAttributeNode(ebuttonIDAttr);
	
	var ebuttonClassAttr = document.createAttribute('class');
	ebuttonClassAttr.value = `btn bdrbtn btn-xs`;
	editButton.setAttributeNode(ebuttonClassAttr);
	
	var editClickAttr = document.createAttribute('onClick');
	editClickAttr.value = `editTran(${transaction['id']})`;
	editButton.setAttributeNode(editClickAttr);
	
	//--------delete button------------//
	var deleteButton = document.createElement('button');
	deleteButton.innerHTML = "delete";

	var dbuttonIDAttr = document.createAttribute('id');
	dbuttonIDAttr.value = `deletebutton${transaction['id']}`;
	deleteButton.setAttributeNode(dbuttonIDAttr);
	
	var dbuttonClassAttr = document.createAttribute('class');
	dbuttonClassAttr.value = `btn bdrbtn btn-xs`;
	deleteButton.setAttributeNode(dbuttonClassAttr);
	
	var deleteClickAttr = document.createAttribute('onClick');
	deleteClickAttr.value = `deleteTran(${transaction['id']})`;
	deleteButton.setAttributeNode(deleteClickAttr);
	
	div0.append(editButton);
	div0.append(br);
	div0.append(deleteButton);
	td0.append(div0);	
	
	///////////////////date column////////////////	
	
	var td1 = document.createElement('td');
	var div1 = document.createElement('div');
	div1.innerHTML = transaction['trans_date'];
		
	var div1IdAttr = document.createAttribute('id');
	var typeID1 = `date${transaction['id']}`;	
	div1IdAttr.value = typeID1;
	div1.setAttributeNode(div1IdAttr);
	td1.append(div1);
		
	/////////////table elements/////////////
	
	///Description/Msg///			
	var td2 = document.createElement('td');
	var div2 = document.createElement('div');
	div2.innerHTML = transaction['trans_msg'];
	td2.append(div2);
		
	var div2IdAttr = document.createAttribute('id');
	var typeID2 = `msg${transaction['id']}`;
	div2IdAttr.value = typeID2;
	div2.setAttributeNode(div2IdAttr);
		
	///Amount///	
	
	var td3 = document.createElement('td');
	var div3 = document.createElement('div');
	div3.innerHTML = transaction['trans_amt'];
	td3.append(div3);
	
	var div3IdAttr = document.createAttribute('id');
	var typeID3 = `amt${transaction['id']}`;	
	div3IdAttr.value = typeID3;
	div3.setAttributeNode(div3IdAttr);

	///category////
	
	var tran_cat_val = transaction['trans_category'];
	
	var td4 = document.createElement('td');
	var div4 = document.createElement('div');
	div4.innerHTML = tran_cat_val;
	td4.append(div4);	
		
	var div4IdAttr = document.createAttribute('id');
	var typeID4 = `category${transaction['id']}`;
	div4IdAttr.value = typeID4;
	div4.setAttributeNode(div4IdAttr);
		
	var div4ClickAttr = document.createAttribute('onClick');
	var div4Function = `catView('${tran_cat_val}', column.CAT)`;
	div4ClickAttr.value = div4Function;
	div4.setAttributeNode(div4ClickAttr);

	///group///
	
	var tran_group_val = transaction['trans_group'];
	
	var td5 = document.createElement('td');
	var div5 = document.createElement('div');
	div5.innerHTML = tran_group_val;
	td5.append(div5);
	
	var div5IdAttr = document.createAttribute('id');
	var typeID5 = `group${transaction['id']}`;
	div5IdAttr.value = typeID5;
	div5.setAttributeNode(div5IdAttr);
	
	var div5ClickAttr = document.createAttribute('onClick');
	var div5Function = `catView('${tran_group_val}', column.GRP)`;
	div5ClickAttr.value = div5Function;
	div5.setAttributeNode(div5ClickAttr);

	///////////////////////end table elements/////////////////////////
	
	tr1.append(td0);
	tr1.append(td1);
	tr1.append(td2);
	tr1.append(td3);
	tr1.append(td4);
	tr1.append(td5);	
	var transRows = document.querySelector('#target');
	transRows.append(tr1);	
}

function catView(data,COLUMN_TYPE, ctype = chartType.PIE ) {
	var catAmtTotal = 0;
	var catCount = 0;
	var catData = 0, grpData = 0;
	var periodType = 0;
	var viewButton = document.querySelector('#navyear');
	var val = viewButton.getAttribute('class');			
	var catDate = document.querySelector('#date-span').innerHTML;		
	var grpHeading = document.querySelector('#cat-grp');
	grpHeading.style.display = 'block';
	var catType = "group";	
	
	if (COLUMN_TYPE == column.CAT){
		catData = data;
		grpData = 0;
		catType = "category";
	}
	else {
		grpData = data;
		catData = 0;
	}
	grpHeading.innerHTML = "Viewing: " + data +  " " + catType;
	console.log(`sentence is ${data} ${catType}`);
	if (inYearView())
		periodType = jperiod.YEAR;
	else if (inEpochView())
		periodType = jperiod.ALL
	else
		periodType = jperiod.MONTH
		
	fetch('jsvcat', {
		method: 'POST',
		body: JSON.stringify({
			jscat: catData,
			jsgrp: grpData,
			jsdate: catDate,
			jsperiod: periodType
		})
	})
	.then(response => response.json())
	.then(transactions => {
		//console.log(transactions[catCount]['trans_amt']);
		
		var transRows = document.querySelector('#target');
		var amount = 0;
		transRows.innerHTML = "";
		transactions.forEach(displayTrans);	
		document.querySelector('#add-form-group').style.display = 'none';	
		document.querySelector('#findby-form').style.display = 'none';	
		
		createCatbyMonthChart(transactions, periodType, ctype);
		
	});		
}

function editTran(tranID) {
	
	document.querySelector(`#editbutton${tranID}`).style.display = 'none';

	var saveButton = document.createElement('button');
	saveButton.innerHTML = "save";
	
///////saveEdit ///////////////////////
	var sbuttonClickAttr = document.createAttribute('onClick');
	sbuttonClickAttr.value = `saveEdit(${tranID})`;
	saveButton.setAttributeNode(sbuttonClickAttr);
	
	var sbuttonClickAttr2 = document.createAttribute('id');
	sbuttonClickAttr2.value = `savebutton${tranID}`;
	saveButton.setAttributeNode(sbuttonClickAttr2);
	
	var sbuttonClickAttr3 = document.createAttribute('class');
	sbuttonClickAttr3.value = `btn btn-primary btn-block btn-xs`;
	saveButton.setAttributeNode(sbuttonClickAttr3);
	
///--create cancel button--//		
	var cancelButton = document.createElement('button');
	cancelButton.innerHTML = "cancel";
		
	var cbuttonClickAttr2 = document.createAttribute('id');
	cbuttonClickAttr2.value = `cancelbutton${tranID}`;
	cancelButton.setAttributeNode(cbuttonClickAttr2);
	
	var cbuttonClickAttr3 = document.createAttribute('class');
	cbuttonClickAttr3.value = `btn btn-primary btn-block btn-xs`;
	cancelButton.setAttributeNode(cbuttonClickAttr3);
	
	var cbuttonClickAttr4 = document.createAttribute('onClick');
	cbuttonClickAttr4.value = `returnToDisplayView(${tranID})`;
	cancelButton.setAttributeNode(cbuttonClickAttr4);	
	
//--display button in date column & remove 'click-to-edit' property--//
	var editColumn = document.querySelector(`#editcolumn${tranID}`);
	editColumn.append(saveButton);
	editColumn.append(cancelButton);		
	
//--get contents of each column/field in row--//
	var dateColumn = document.querySelector(`#date${tranID}`);
	var msgColumn = document.querySelector(`#msg${tranID}`);
	var amtColumn =  document.querySelector(`#amt${tranID}`);
	var catColumn =  document.querySelector(`#category${tranID}`);
	var groupColumn =  document.querySelector(`#group${tranID}`);
	var existingDate = dateColumn.innerHTML;
	var existingMsg = msgColumn.innerHTML;
	var existingAmt = amtColumn.innerHTML;
	var existingCat = catColumn.innerHTML;
	var existingGroup = groupColumn.innerHTML;
	
//--create text boxes to allow for editing--//
	var dateTextBox = document.createElement('textArea');
	var msgTextBox = document.createElement('textArea');
	var amtTextBox = document.createElement('textArea');
	var catTextBox = document.createElement('textArea');
	var groupTextBox = document.createElement('textArea');
	
	var dateTextBoxWidthAttr = document.createAttribute('cols');
	dateTextBoxWidthAttr.value = "20";
	
	var msgTextBoxWidthAttr = document.createAttribute('cols');
	msgTextBoxWidthAttr.value = "60";
	
	var amtTextBoxWidthAttr = document.createAttribute('cols');
	amtTextBoxWidthAttr.value = "6";
	amtTextBox.setAttributeNode(amtTextBoxWidthAttr);
	
	var catTextBoxWidthAttr = document.createAttribute('cols');
	catTextBoxWidthAttr.value = "8";
	catTextBox.setAttributeNode(catTextBoxWidthAttr);
	
	var groupTextBoxWidthAttr = document.createAttribute('cols');
	groupTextBoxWidthAttr.value = "8";
	groupTextBox.setAttributeNode(groupTextBoxWidthAttr);
		
	dateTextBox.innerHTML = existingDate;
	dateColumn.innerHTML = '';
	dateColumn.append(dateTextBox);
	
	msgTextBox.innerHTML = existingMsg;
	msgColumn.innerHTML = '';
	msgColumn.append(msgTextBox);
	
	amtTextBox.innerHTML = existingAmt;
	amtColumn.innerHTML = '';
	amtColumn.append(amtTextBox);
	
	var clearClickAttr = document.createAttribute('onClick');
	clearClickAttr.value = ``;
	catColumn.setAttributeNode(clearClickAttr);
	
	catTextBox.innerHTML = existingCat;
	catColumn.innerHTML = '';
	catColumn.append(catTextBox);
	
	var clearGroupClickAttr = document.createAttribute('onClick');
	clearGroupClickAttr.value = ``;
	groupColumn.setAttributeNode(clearGroupClickAttr);
	
	groupTextBox.innerHTML = existingGroup;
	groupColumn.innerHTML = '';
	groupColumn.append(groupTextBox);	
}

function saveEdit(tranID) {	
	document.querySelector(`#editbutton${tranID}`).style.display = 'block';
	tdate = document.querySelector(`#date${tranID} > textarea`).value;
	tamt = document.querySelector(`#amt${tranID} > textarea`).value;
	tcat = document.querySelector(`#category${tranID} > textarea`).value;
	tgrp = document.querySelector(`#group${tranID} > textarea`).value;
	tmsg = document.querySelector(`#msg${tranID} > textarea`).value;
	
	fetch('edittransaction', {
		method: 'PUT',
		body: JSON.stringify({
			jdate: tdate,
			jid: tranID,			
			jamt: tamt,
			jcat: tcat,
			jgrp: tgrp,
			jmsg: tmsg
		}) 
	})
	.then(response => response.json())
	.then(result => {		
		if (result['reload_necessary']) { //reload if amount/category change to allow pie display to update
			let period = "month";
			
			const submitEvent = new SubmitEvent("submit");			
			changeChart();
			//findTrans---ByDate(submitEvent);
			console.log("saveEdit: reload path");
		}
		else {
			returnToDisplayView(tranID);
			console.log("saveEdit: no reload path");
		}
	});
}

function returnToDisplayView(tranID) {	
	console.log("ret to display view");
	tdate = document.querySelector(`#date${tranID} > textarea`).value;
	tamt = document.querySelector(`#amt${tranID} > textarea`).value;
	tcat = document.querySelector(`#category${tranID} > textarea`).value;
	tgrp = document.querySelector(`#group${tranID} > textarea`).value;
	tmsg = document.querySelector(`#msg${tranID} > textarea`).value;
	
	document.querySelector(`#date${tranID}`).innerHTML = tdate;
	document.querySelector(`#amt${tranID}`).innerHTML = tamt;
	document.querySelector(`#msg${tranID}`).innerHTML = tmsg;
	
	var catCol = document.querySelector(`#category${tranID}`);
	catCol.innerHTML = tcat;
	var catColClickAttr = document.createAttribute('onClick');
	catColFunction = `catView('${tcat}')`;
	catColClickAttr.value = catColFunction;
	catCol.setAttributeNode(catColClickAttr);
	
	var grpCol = document.querySelector(`#group${tranID}`);
	grpCol .innerHTML = tgrp;
	var grpColClickAttr = document.createAttribute('onClick');
	grpColFunction = `catView('${tgrp}')`;
	grpColClickAttr.value = grpColFunction;
	grpCol.setAttributeNode(grpColClickAttr);
	
	editButton = document.querySelector(`#editbutton${tranID}`);
	
	var editClick = document.createAttribute('onClick');
	editClick.value = `editTran(${tranID})`;
	editButton.setAttributeNode(editClick);
	editButton.style.display = 'block'; 
		
	Sb = document.querySelector(`#savebutton${tranID}`);
	Cb = document.querySelector(`#cancelbutton${tranID}`);
	Sb.remove();
	Cb.remove()
}

function createCatbyMonthChart(transactions, periodType=0, ctype = chartType.PIE) {
	var creditMap = new Object();
	var debitMap = new Object();
	var dtotal = 0;
	var ctotal = 0;
	var tranCount = 0;
		
	//build summary table
	if (periodType == jperiod.MONTH) {
		while (tran = transactions[tranCount++]) {		
			var tDate = tran['trans_date'];	
			console.log(`tdate: ${tDate}`);
			var tAmount = parseFloat(tran['trans_amt']);		

			//credits
			if (tAmount > 0) {
				if (creditMap[tDate]) {			
					creditMap[tDate] += Math.abs(tAmount);
				}
				else {				
					creditMap[tDate] = Math.abs(tAmount);
				}
				ctotal += Math.abs(tAmount);
			}
			//debits
			else {
				if (debitMap[tDate]) {
					debitMap[tDate] += Math.abs(tAmount);
				}
				else {
					debitMap[tDate] = Math.abs(tAmount);
				}
				dtotal += Math.abs(tAmount);
			}		
		}
	} 
	else {
		while (tran = transactions[tranCount++]) {		
			var iDate = tran['trans_date'];
			var tDate = getTextMonth(parseInt(iDate.substring(5,7))) + " " + iDate.substring(0,4);
			//tDate = tDate.substring(0,7);
			
			//console.log(`tdate: ${tDate}`);
			var tAmount = parseFloat(tran['trans_amt']);		
			//credits
			if (tAmount > 0) {
				if (creditMap[tDate]) {			
					creditMap[tDate] += Math.abs(tAmount);
				}
				else {				
					creditMap[tDate] = Math.abs(tAmount);
				}
				ctotal += Math.abs(tAmount);
			}
			//debits
			else {
				if (debitMap[tDate]) {
					debitMap[tDate] += Math.abs(tAmount);
				}
				else {
					debitMap[tDate] = Math.abs(tAmount);
				}
				dtotal += Math.abs(tAmount);
			}		
		}
	}
		
	var chartViewBtn = document.querySelector("#chart-view-btn");	
	chartViewBtn.innerHTML = "Bar Graph";
	populateCharts(debitMap, creditMap, dtotal, ctotal, ctype);
	var savingsDiv = document.querySelector('#amt-saved');
	savingsDiv.style.display = 'none';
	console.log("via createbyCat");
	
}

function createChart(transactions, ctype = chartType.PIE) {
	var creditMap = new Object();
	var debitMap = new Object();
	var dtotal = 0;
	var ctotal = 0;
	var tranCount = 0
	
	//build summary table
	while (tran = transactions[tranCount++]) {		
		tCategory = tran['trans_category'];			
		tAmount = parseFloat(tran['trans_amt']);				
		if (tCategory.toLowerCase() === "transfer") //transfer from one account to another
			continue;
		//credits
		if (tAmount > 0) {
			if (creditMap[tCategory]) {			
				creditMap[tCategory] += Math.abs(tAmount);
			}
			else {				
				creditMap[tCategory] = Math.abs(tAmount);
			}
			ctotal += Math.abs(tAmount);
		}
		//debits
		else {
			if (debitMap[tCategory]) {
				debitMap[tCategory] += Math.abs(tAmount);
			}
			else {
				debitMap[tCategory] = Math.abs(tAmount);
			}
			dtotal += Math.abs(tAmount);
		}		
	}
	var savingsDiv = document.querySelector('#amt-saved');
	savingsDiv.style.display = 'block';
	console.log("via createbydates");
	populateCharts(debitMap, creditMap, dtotal, ctotal, ctype);
}	

function populateCharts(debitMap, creditMap, dtotal, ctotal, ctype = chartType.PIE) {
	var debitRows = document.querySelector('#debit-overview');
	debitRows.innerHTML = "";
	var creditRows = document.querySelector('#credit-overview');
	creditRows.innerHTML = "";
		
	debov = document.querySelector('#debit-pie');
	debov.innerHTML = '';
	credov = document.querySelector('#credit-pie');
	credov.innerHTML = '';
	
	if (Object.entries(debitMap).length > 0) {
		document.querySelector('#detail-table1').style.display = 'block';
		drawChart(debitMap, document.getElementById('debit-pie'), Object.entries(debitMap).length, ctype);
		document.querySelector('#tot-deb').innerHTML = dtotal.toFixed(2);
		populateSummaryTable(debitMap, debitRows);
	}
	else
		document.querySelector('#detail-table1').style.display = 'none';
	
	
	if (Object.entries(creditMap).length > 0) {
		document.querySelector('#detail-table2').style.display = 'block';
		drawChart(creditMap, document.getElementById('credit-pie'), Object.entries(creditMap).length, ctype);		
		document.querySelector('#tot-cred').innerHTML = ctotal.toFixed(2);
		populateSummaryTable(creditMap, creditRows);
	}
	else
		document.querySelector('#detail-table2').style.display = 'none';
		
	var savingsDiv = document.querySelector('#amt-saved');
	var totsaved = ctotal - dtotal;
	savingsDiv.innerHTML = `Total Savings: ${totsaved.toFixed(2)}`;
	console.log(`ctot: ${ctotal}, dtot ${dtotal}, totes: ${totsaved}`);
}

function populateSummaryTable(tranMap, summaryElement) {
		
		let entryCount = 0;
		for (const [key, value] of Object.entries(tranMap)) {
			var tr1 = document.createElement('tr');		
			var td0 = document.createElement('td');
			var td1 = document.createElement('td');
			var div0 = document.createElement('div');
			var div1 = document.createElement('div');
			div0.innerHTML = key;
			div1.innerHTML = `$ ${value.toFixed(2)}`;
			td0.append(div0);
			td1.append(div1);
			tr1.append(td0);
			tr1.append(td1);
			summaryElement.append(tr1);	
			//console.log(`key: ${key}, val: ${value}`);
		}	
}

// Draw the chart and set the chart values
function drawChart(tranMap, outerElement, tcount, ctype = chartType.PIE) {
	kk = Object.keys(tranMap);
	console.log(`map: ${kk}, tcount ${tcount}`);
	var chartData = buildList(tranMap);
	var data = google.visualization.arrayToDataTable(chartData);
	let scaledHeight = 800;
	if (ctype == chartType.PIE) {
		var chart = new google.visualization.PieChart(outerElement); 
		console.log("pie");
	}
	else {//bar chart
		var chart = new google.visualization.BarChart(outerElement); 
		console.log("bar");
		scaledHeight = 50 * tcount;	
	}
	var options = { 
		is3D: true, 
		'width':800, 
		'height':scaledHeight};
	chart.draw(data, options);
}  

function buildList(imap) {
	var tranMapKeys = Object.keys(imap);
	
	var returnList = [["Title", "Summary"]];////////////////////TBD////////////
	for (k of tranMapKeys) {		
		var kv = [k , imap[k]];
		returnList.push(kv);
	}	
	return returnList;
}

function changeChart() {
	var chartViewBtn = document.querySelector("#chart-view-btn");
	var stateIndicator = chartViewBtn.innerHTML;
	
	console.log(`changeChart,stateIndicator: ${stateIndicator}`);
	let ctype = chartType.PIE;
	//Chart in Pie state if stateIndicator == bar graph
	if (stateIndicator == "Bar Graph") {
		chartViewBtn.innerHTML = "Pie Graph";
		ctype = chartType.BAR;		
		console.log("barbranch");
	}
	else {		
		chartViewBtn.innerHTML = "Bar Graph";
		ctype = chartType.PIE;
		console.log("piebranch");
	}
	
	var cat_grpDiv = document.querySelector('#cat-grp');
	var msg = cat_grpDiv.innerHTML;
	var msgs = msg.split(" ");
	clearAllCharts();
	//using cat_grp div to indicate if we are looking at a category view or by month view
	//this will tell us which function to use to populate our graphic
	if (cat_grpDiv.style.display == 'none') {
		//not displayed -> in non-category view
		
		if(inYearView()) {			
			var displayDate = document.querySelector('#date-span');
			var dd = displayDate.innerHTML;
			let rgex = /\d\d\d\d/;
			dd = dd.substring(dd.search(rgex));
			var yr = dd.substring(dd.search(rgex), dd.search(" "));
			loadTable(yr.concat("/11/11"), jperiod.YEAR, ctype);			
		}
		else if (inEpochView()) {
			loadTable(0, jperiod.ALL, ctype);
			console.log(`loadeposh ${ctype}`);
		}
		else {
			var dateOrDefaultToZero = 0;
			
			if (dateElem = document.querySelector('#bydate').value) {
				//var tdate1 = dateElem;
				//console.log(`tdate1: ${tdate1} `);
								
				dateOrDefaultToZero = dateElem.replace(/-/g, "/");				
				console.log(`dateOrDefaultToZero: ${dateOrDefaultToZero} ++ ${dateElem}`);
			}
			loadTable(dateOrDefaultToZero,jperiod.MONTH,ctype);
			console.log(`loadtable ${ctype}`);
		}
		console.log('in the cat_grpDiv branch');
	}
	else {
		catView(msgs[1], (msgs[2] == "group") ? column.GRP : column.CAT, ctype);
		console.log(`catview ${ctype}`);
	}
	console.log("endof changeChart");
	
}