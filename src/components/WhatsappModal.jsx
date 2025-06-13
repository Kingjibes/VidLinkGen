import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Users, CheckCircle } from 'lucide-react';

const WhatsappModal = ({ open, onFinished }) => {
  const [channelsClicked, setChannelsClicked] = useState({ channel1: false, channel2: false });

  const channels = [
    {
      id: 'channel1',
      name: 'Channel 1',
      url: 'https://whatsapp.com/channel/0029VaN2eQQ59PwNixDnvD16/7593',
    },
    {
      id: 'channel2',
      name: 'Channel 2',
      url: 'https://whatsapp.com/channel/0029Vb3wqli8V0tfOrWXwk2K',
    },
  ];

  const handleJoin = (url, id) => {
    window.open(url, '_blank');
    setChannelsClicked(prev => ({ ...prev, [id]: true }));
  };

  const allChannelsJoined = channelsClicked.channel1 && channelsClicked.channel2;

  return (
    <Dialog open={open}>
      <DialogContent className="glass-effect border-white/20">
        <DialogHeader>
          <DialogTitle className="text-gradient font-orbitron text-2xl">
            One Last Step!
          </DialogTitle>
          <DialogDescription>
            Join our exclusive channels to get the latest updates, tips, and support. Please click both links.
          </DialogDescription>
        </DialogHeader>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="my-4 space-y-4"
        >
          {channels.map((channel) => (
            <Button
              key={channel.id}
              onClick={() => handleJoin(channel.url, channel.id)}
              className="w-full justify-start text-lg bg-green-500/10 hover:bg-green-500/20 text-green-300 border border-green-500/30"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <Users className="mr-4 h-5 w-5" />
                  Join {channel.name} on WhatsApp
                </div>
                {channelsClicked[channel.id] && (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                )}
              </div>
            </Button>
          ))}
        </motion.div>
        <DialogFooter>
          <Button 
            onClick={onFinished} 
            className="w-full cyber-glow"
            disabled={!allChannelsJoined}
          >
            {allChannelsJoined ? "I've Joined, Let's Go!" : "Please Join Both Channels"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsappModal;