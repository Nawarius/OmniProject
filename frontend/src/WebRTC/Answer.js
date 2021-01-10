// import createPeer from './createPeer'

const handleRecieveCall = async (incoming, peerRef, userStreamRef, socketRef, createPeer, otherUserRef, partnerVideoRef) => {
    console.log('Recieve')
    peerRef.current = createPeer(0, peerRef, socketRef, otherUserRef, partnerVideoRef)
    const desc = new RTCSessionDescription(incoming.sdp)

    await peerRef.current.setRemoteDescription(desc)
    await userStreamRef.current.getTracks().forEach(track => peerRef.current.addTrack(track, userStreamRef.current))
    const answer = await peerRef.current.createAnswer()
    await peerRef.current.setLocalDescription(answer)
    
    const payload = {
        target:incoming.caller,
        caller:socketRef.current.id,
        sdp:peerRef.current.localDescription
    }

    socketRef.current.emit('answer', payload)
    
}

export default handleRecieveCall