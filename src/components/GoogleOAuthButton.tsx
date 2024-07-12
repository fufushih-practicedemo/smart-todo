import React from 'react'
import { Button } from '@/components/ui/button'
import { RiGoogleFill } from '@remixicon/react';
import { getGoogleOAuthConsentUrl } from '@/actions/auth';
import { toast } from 'sonner';

const GoogleOAuthButton = () => {
  return (
    <Button 
      type="button"
      onClick={async () => {
        const res = await getGoogleOAuthConsentUrl();
        if(res.url) {
          window.location.href = res.url
        } else {
          toast.error(res.error);
        }
      }}
    >
      <RiGoogleFill className='size-4 mr-2' /> Login with Google
    </Button>
  )
}

export default GoogleOAuthButton
