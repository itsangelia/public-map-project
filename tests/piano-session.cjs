const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');const {buildSync}=require('esbuild');const scope={};vm.runInNewContext(buildSync({entryPoints:['piano-session.js'],bundle:true,format:'iife',globalName:'piano',write:false}).outputFiles[0].text,scope);const {claimPiano,PIANO_MIDI}=scope.piano;
test('one active performer, safe release by expiry or missing presence, 21 diatonic pitches',()=>{
 const players={a:{first:{}},b:{second:{}}},seat=claimPiano(null,'a','first','A','token-a',1000,players);
 assert.equal(seat.until,13000);assert.equal(claimPiano(seat,'b','second','B','token-b',1100,players),undefined);
 assert.equal(claimPiano(seat,'a','other-tab','A','token-c',1100,players),undefined);
 assert.equal(claimPiano(seat,'b','second','B','token-b',13000,players).uid,'b');
 delete players.a.first;assert.equal(claimPiano(seat,'b','second','B','token-b',1200,players).uid,'b');
 assert.equal(PIANO_MIDI.length,21);assert.equal(PIANO_MIDI[0],48);assert.equal(PIANO_MIDI[20],83);assert.equal(new Set(PIANO_MIDI).size,21);
});
test('piano permissions are additive and preserve every existing room rule',()=>{
 const cp=require('node:child_process'),fs=require('node:fs');const before=JSON.parse(cp.execFileSync('git',['show','stable-fishing-2026-10-20:database.rules.json'])).rules.rooms.$room;
 const after=JSON.parse(fs.readFileSync('database.rules.json')).rules.rooms.$room;
 for(const key of Object.keys(before))assert.deepEqual(after[key],before[key],key+' unchanged');
 assert.deepEqual(Object.keys(after).filter(k=>!(k in before)).sort(),['pianoNotes','pianoSeat']);
});
