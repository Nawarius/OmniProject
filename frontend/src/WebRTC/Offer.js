const handleNegotiation = async (userID, peerRef, socketRef) => {
    console.log('Offer')
    const offer = await peerRef.current.createOffer()
    await peerRef.current.setLocalDescription(offer)
    const payload = {
        target:userID,
        caller:socketRef.current.id,
        sdp:peerRef.current.localDescription
    }
    socketRef.current.emit('offer', payload)
  }

export default handleNegotiation