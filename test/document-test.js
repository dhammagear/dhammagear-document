"use strict";
var D=require('../document');
console.log('dhammagear document test suite');

QUnit.test('new page',function(){
	var doc=D.createDocument();
	var d=doc.createPage();
//	equal(d.getInscription(),"");
	equal(d.id,1);
	equal(doc.pageCount,2);
});

QUnit.test('migrate markup (delete)',function(){
	var doc=D.createDocument();
	var deletemiddle={start:3,len:3,payload:{text:""}};
	var payload={nothing:true}
	var left={start:0,len:3,payload:payload};
	var m=doc.migrateMarkup( left , deletemiddle) //
	equal(m.start,0);equal(m.len,3);

	var right={start:6,len:3,payload:payload};
	m=doc.migrateMarkup( right , deletemiddle) //
	equal(m.start,3);equal(m.len,3);

	var middle={start:4,len:1,payload:payload};
	m=doc.migrateMarkup( middle , deletemiddle) 
	equal(m.start,3);equal(m.len,0);

  var leftpartial={start:2,len:3,payload:payload};
	m=doc.migrateMarkup( leftpartial , deletemiddle);
	equal(m.start,2);equal(m.len,1);

	var partial={start:2,len:5,payload:payload};
	m=doc.migrateMarkup( partial , deletemiddle) 
	equal(m.start,2);equal(m.len,2);

  var rightpartial={start:4,len:3,payload:payload};
	m=doc.migrateMarkup( rightpartial , deletemiddle);
	equal(m.start,3);equal(m.len,1);
});
	//insert text
		//  markup    x    xx      xx      xyz      xyyyz        xyz  
		//  delete   ---   ---    ---       ---      ---        ---     
		//  dout     |     |      |		     x        xz          z            
		//  insert   +++ x +++xx  +++ xx   x+++yz   x+++yyyz    +++ xyz
QUnit.test('evolve markup (insert)',function(){
	var doc=D.createDocument();
	var payload={nothing:true}
	var insertmiddle={start:3,len:0,payload:{text:"+++"}};

	var left={start:0,len:3,payload:payload};
	var m=doc.migrateMarkup( left , insertmiddle) // no change
	equal(m.start,0);equal(m.len,3);

	var right={start:6,len:3,payload:payload};
	m=doc.migrateMarkup( right , insertmiddle) //
	equal(m.start,9);equal(m.len,3);

	var middle={start:4,len:1,payload:payload};
	m=doc.migrateMarkup( middle , insertmiddle) 
	equal(m.start,7);equal(m.len,1);

  var leftpartial={start:2,len:3,payload:payload};
	m=doc.migrateMarkup( leftpartial , insertmiddle);
	equal(m.start,2);equal(m.len,6);

	var partial={start:2,len:5,payload:payload};
	m=doc.migrateMarkup( partial , insertmiddle) 
	equal(m.start,2);equal(m.len,8);

  var rightpartial={start:4,len:3,payload:payload};
	m=doc.migrateMarkup( rightpartial , insertmiddle);
	equal(m.start,7);equal(m.len,3);

});

var origin="道可道非常道名可名非常名";

QUnit.test('evolve page',function(){
	var doc=D.createDocument();
	var daodejin=doc.createPage(origin);
	equal(daodejin.id,1);

	equal(daodejin.inscription,origin);

	daodejin.addRevision(4,1,'恆');
	daodejin.addRevision(6,0,'也');
	daodejin.addRevision(10,1,'恆');
	daodejin.addRevision(12,0,'也');
	daodejin.addMarkup(2,1,{name:"動詞"});
	daodejin.addMarkup(8,1,{name:"動詞"});

	var mawang=doc.evolvePage(daodejin)
	equal(daodejin.getMutant(0).id,mawang.id);
	equal(mawang.inscription,"道可道非恆道也名可名非恆名也");
	var m1=mawang.getMarkup(0);
	var m2=mawang.getMarkup(1);

	equal(m1.start, 2);
	equal(m2.start, 9); 

	daodejin.clearRevisions(); //prepare for new evolution
	daodejin.addRevision(3,0,"，");
	daodejin.addRevision(6,0,"；");
	daodejin.addRevision(9,0,"，");
	daodejin.addRevision(12,0,"。");
	var punc=doc.evolvePage(daodejin);
	equal(punc.inscription,"道可道，非常道；名可名，非常名。");

	equal(doc.pageCount,4);//root,daodejin,mawang,punc

	//ng=doc.coevolve(mawang,punc);
	//equal(ng.getInscription,"道可道，非恆道也；名可名，非恆名也。");
});
QUnit.test('clear markup by range',function() {
	var doc=D.createDocument();
	var daodejin=doc.createPage(origin);

	daodejin.addMarkup(1,2,{empty:true});
	daodejin.addMarkup(5,1,{empty:true});

	daodejin.clearMarkups(0,3);
	equal(daodejin.markupCount,1);
	daodejin.clearMarkups(5,1);
	equal(daodejin.markupCount,0)

});
QUnit.test('validate markup position',function() {
	var doc=D.createDocument();
	var daodejin=doc.createPage(origin);
	daodejin.addMarkup(0,-1,{empty:true});
	daodejin.addMarkup(-10,-1,{empty:true});
	daodejin.addMarkup(-10,5,{empty:true});
	daodejin.addMarkup(13,2,{empty:true});
	daodejin.addMarkup(10,10,{empty:true});

	var m=function(i) { return daodejin.getMarkup(i)};
	equal(m(0).start,0,'markup 1 start');
	equal(m(0).len,origin.length,'markup 1 length');
	equal(m(1).start,0,'markup 2 start');
	equal(m(1).len,origin.length,'markup 2 length');
	equal(m(2).start,0,'markup 3 start');
	equal(m(2).len,5,'markup 3 length');
	equal(m(3).start,12,'markup 4 start');
	equal(m(3).len,0,'markup 4 length');
	equal(m(4).start,10,'markup 5 start');
	equal(m(4).len,2,'markup 5 length');

});
QUnit.test('markups devolve to parent  ',function(){
	var doc=D.createDocument();
	var daodejin=doc.createPage(origin+"。");
	daodejin.addRevision(6,0,'也');
	daodejin.addRevision(12,0,'也');
	var mawang=doc.evolvePage(daodejin);
	//道可道非常道也名可名非常名也。

	mawang.addRevisions( mawang.revert );
	//道可道非常道名可名非常名。
	var daodejin2=doc.evolvePage(mawang);
	equal(daodejin2.inscription,origin+"。","rollback with revert revision"); 

	mawang.addMarkup(13,1,{name:"虛字"});
	mawang.addMarkup(9,1,{name:"動詞"});
	mawang.addMarkup(5,3,{name:"道也名"}); 

	var M=doc.downgrade(mawang); //downgrade to parent
	
	equal(M[0].start,12,'markup 1 start');
	equal(M[0].len,0,'markup 1 len'); //vanish

	equal(M[1].start,8,'markup 2 start');
	equal(M[1].len,1,'markup 2 len'); //survive
	equal(daodejin2.inscription.substr(M[1].start,M[1].len),"名");
	
	equal(M[2].start,5,'markup 3 start');
	equal(M[2].len,2,'markup 3 len'); //survive but content changed
	equal(daodejin2.inscription.substr(M[2].start,M[2].len),"道名");

	
});

QUnit.test('validate revision',function(){
	var doc=D.createDocument();
	var daodejin=doc.createPage(origin+"。");
	daodejin.addRevision(0,3,"");//delete 道可道
	equal(daodejin.revisionCount,1);
	daodejin.addRevision(1,1,"");//delete 可
	equal(daodejin.revisionCount,1);

});

QUnit.test('devolve markups to ancestor',function(){
	var doc=D.createDocument();
	var daodejin=doc.createPage(origin+"。");

	daodejin.addRevision(6,0,'也');
	var daodejin2=doc.evolvePage(daodejin);

	daodejin2.addRevision(13,0,'也');
	var daodejin3=doc.evolvePage(daodejin2);	
  //道可道非常道也名可名非常名也。
	daodejin3.addMarkup(14,1,"句號");
	var M=doc.migrate(daodejin3,daodejin);
	equal( daodejin3.inscription.substr(14,1),"。")
	equal(M[0].start,12);
	equal( daodejin.inscription.substr(M[0].start,M[0].len),"。")

//markup 
	
});

QUnit.test('migrate markups',function(){
//find MRCA, B devolve to MRCA, evolve to C
//test two seperate page. all markup become 0,0
	var doc=D.createDocument();
	var daodejin=doc.createPage(origin+"。");

	daodejin.addRevision(6,0,'也');
	var mawang1=doc.evolvePage(daodejin);

	mawang1.addRevision(0,0,'第一章');
	var mawang2=doc.evolvePage(mawang1);	
	//第一章道可道非常道也名可名非常名
	mawang2.addMarkup(13,3,"非常名");
	equal(mawang2.inscription.substr(13,3),"非常名")

	daodejin.clearRevisions();
	daodejin.addRevision(3,0,'，');
	daodejin.addRevision(6,0,'；');
	var punc1=doc.evolvePage(daodejin);
	//道可道，非常道；名可名非常名
	punc1.addRevision(11,0,'，');
	punc1.addRevision(14,0,'。');
	var punc2=doc.evolvePage(punc1);
	//
	//道可道，非常道；名可名，非常名。
	
	var ancestor=doc.findMRCA(mawang2,punc2);
	equal(ancestor.id,daodejin.id);
	var M=doc.migrate(mawang2,daodejin);	//downgrade to ancestor
	equal(M[0].start,9);
	equal(daodejin.inscription.substr(M[0].start,M[0].len),"非常名");

	var M=doc.migrate(mawang2,punc2); //downgrade to ancestor and upgrade to punc2
	equal(M[0].start,12);
	equal(punc2.inscription.substr(M[0].start,M[0].len),"非常名");	

	var leafpages=doc.getLeafPages().leafPages;
	equal(leafpages.length,2);

	equal(punc2.isLeafPage(),true);
	equal(mawang2.isLeafPage(),true);
	equal(mawang1.isLeafPage(),false);
	equal(punc1.isLeafPage(),false);
});

QUnit.test('preview',function(){
	var doc=D.createDocument();
	var daodejin=doc.createPage(origin);
	equal(daodejin.id,1);
	daodejin.addRevision(4,1,'恆');	
	var mawang=doc.evolvePage(daodejin,{preview:true});
	equal(doc.pageCount,2);
});

QUnit.test('load from json',function(){
	var doc=D.createDocument();
	var daodejin=doc.createPage({name:"ch1",text:origin+"。"});

	daodejin.addRevision(6,0,'也');
	var daodejin2=doc.evolvePage(daodejin);

	daodejin2.addRevision(4,1,'恆');
	daodejin2.addRevision(11,1,'恆');
	daodejin2.addRevision(13,0,'也');
	var daodejin3=doc.evolvePage(daodejin2);
	var jsonstring=doc.toJSONString();
	var json=JSON.parse(jsonstring);
	equal(typeof json[1].t,'undefined'); //removed in persistent json
	equal(typeof json[2].t,'undefined'); //removed in persistent json
	equal(typeof json[3].t,'string');

	var doc2=D.createDocument(json);

	equal(doc2.getPage(1).inscription,origin+"。")
	equal(doc2.getPage(3).inscription,"道可道非恆道也名可名非恆名也。")

	//lastest version
	equal(doc2.pageByName("ch1").inscription,"道可道非恆道也名可名非恆名也。")
	//previous version
	equal(doc2.pageByName("ch1",0).inscription,origin+"。")
	equal(doc2.pageByName("ch1",1).inscription,"道可道非常道也名可名非常名。")
	equal(doc.pageByName("ch1").version,2);
})
/*
var F=require('../xml');
var fs=require('fs');
QUnit.test('reunit',function(){
	var buf=fs.readFileSync('./test1.xml','utf8').replace(/\r\n/g,'\n').replace(/\r/g,'\n');
	var doc=F.importXML(buf,{"template":"accelon"});
	var doc2=D.reunit(doc,"p");
	equal(doc2.pageCount,5);
	//doc3=D.reunit(doc2,"pb");
	//equal(doc3.pageCount,3);
	//check converted tag
	//export to XML
	//compare with test1.xml
})
*/

/*
var fs=require('fs');
var F=require('../xml');
QUnit.test('fission',function(){
	var buf=fs.readFileSync('./test1.xml','utf8').replace(/\r\n/g,'\n').replace(/\r/g,'\n');
	var doc=F.importXML(buf,{"template":"accelon", "whole":true});
	equal(doc.pageCount,2);
	equal(doc.getPage(1).markupCount,14);
  var pg=doc.getPage(1);
  var ptags=pg.findMarkup({name:"p"});
  var oldversion=doc.version;
  var breakpoints=ptags.map(function(P){return P.start});
  
	pg.fission(breakpoints);
	equal(pg.daugtherStart , oldversion);
	equal(pg.daugtherCount, breakpoints.length+1);

	equal(doc.version-oldversion,breakpoints.length+1);
	var dpg=doc.getPage(pg.daugtherStart);
	var m=doc.getPage(pg.daugtherStart+3).markupAt(8);
	equal(m[0].payload.name,'p');
	equal(m[1].payload.name,'f');

	var jsonstring=doc.toJSONString();
	var json=JSON.parse(jsonstring);
	console.log(json)
	equal(typeof json[1].t,'undefined','inscription removed');
	var doc2=D.createDocument(json);
	equal(doc2.getPage(1).inscription,doc.getPage(1).inscription);
});

*/
