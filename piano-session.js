// A short server-time lease prevents a disconnected performer blocking the piano.
export function claimPiano(seat,uid,connection,nickname,token,now,players){
 if(seat&&seat.until>now&&players?.[seat.uid]?.[seat.connection]&&(seat.uid!==uid||seat.connection!==connection))return undefined;
 return {uid,connection,nickname,token,until:now+12000};
}
export const PIANO_MIDI=Array.from({length:21},(_,i)=>[48,50,52,53,55,57,59][i%7]+12*Math.floor(i/7));
