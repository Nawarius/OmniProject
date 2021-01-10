import handleNegotiation from './Offer'

    const createPeer = (userID, peerRef, socketRef, otherUserRef, partnerVideoRef) => {
    const peer = new RTCPeerConnection({
        iceServers:[
            {
                urls: "stun:stun.stunprotocol.org"
            },
            {
                urls: 'turn:numb.viagenie.ca',
                credential: 'muazkh',
                username: 'webrtc@live.com'
            },
        ]
    })
    //console.log(partnerVideoRef)
    peer.onicecandidate = (e) => handleICECandidateEvent(e, socketRef, otherUserRef)
    peer.onnegotiationneeded = () => handleNegotiation(userID, peerRef, socketRef)
    peer.ontrack = (e) => handleTrackEvent(e, partnerVideoRef)

    return peer
}
  
const handleICECandidateEvent = (e, socketRef, otherUserRef) =>{
    if(e.candidate){
        const payload = {
            target:otherUserRef.current,
            candidate:e.candidate
        }
        socketRef.current.emit('ice-candidate', payload)
    }
  }

  const handleTrackEvent = (e, partnerVideoRef) => {
      console.log(e.streams[0])
      partnerVideoRef.current.srcObject = e.streams[0]
    }

export default createPeer