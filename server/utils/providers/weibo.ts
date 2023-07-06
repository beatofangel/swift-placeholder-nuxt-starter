import type { OAuthConfig, OAuthUserConfig } from 'next-auth/providers'

interface WeiboProfile extends Record<string, any> {
  id: number,
  idstr: string,
  screen_name: string,
  name: string,
  province: number,
  city: number,
  location: string,
  description: string,
  url: string,
  profile_image_url: string,
  profile_url: string,
  domain: string,
  weihao: string,
  gender: string,
  followers_count: number,
  friends_count: number,
  statuses_count: number,
  favourites_count: number,
  created_at: string,
  following: boolean,
  allow_all_act_msg: boolean,
  geo_enabled: boolean,
  verified: boolean,
  verified_type: number,
  remark: string,
  status: {
    created_at: string,
    id: number,
    mid: number,
    idstr: string,
    text: string,
    source: string,
    favorited: boolean,
    truncated: boolean,
    in_reply_to_status_id: string,
    in_reply_to_user_id: string,
    in_reply_to_screen_name: string,
    thumbnail_pic: string,
    bmiddle_pic: string,
    original_pic: string,
    geo: object,
    user: object,
    retweeted_status: object,
    reposts_count: number,
    comments_count: number,
    attitudes_count: number,
    mlevel: number,
    visible: object,
    pic_ids: object,
    ad: object[]
  },
  allow_all_comment: boolean,
  avatar_large: string,
  avatar_hd: string,
  verified_reason: string,
  follow_me: boolean,
  online_status: number,
  bi_followers_count: number,
  lang: string
}

export const useWeiboProvider = <P extends WeiboProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> => {
  return {
    id: 'weibo',
    name: 'Weibo',
    type: 'oauth',
    authorization: 'https://api.weibo.com/oauth2/authorize',
    token: {
      url: 'https://api.weibo.com/oauth2/access_token',
      async request({ client, provider, params, checks }) {
        console.log(params)
        const { remind_in, uid, isRealName, ...tokens } = await client.oauthCallback(provider.callbackUrl, params, checks)
        tokens.providerAccountId = uid
        return { tokens }
      },
    },
    userinfo: {
      url: 'https://api.weibo.com/2/users/show.json',
      async request({ client, tokens, }) {
        console.log(tokens)
        const data = await $fetch('https://api.weibo.com/2/users/show.json', {
          params: {
            access_token: tokens.access_token,
            uid: tokens.providerAccountId
          }
        })
        console.log(data)
        // TODO
        // const email = await $fetch('https://api.weibo.com/2/account/profile/email.json', {
        //   params: {
        //     access_token: context.tokens.access_token,
        //   }
        // })
        // console.log(data, email)
        const userInfo = data as P
        return userInfo
      }
    },
    profile(profile) {
      return {
        id: profile.id.toString(),
        name: profile.name,
        email: null, // TODO
        image: profile.profile_image_url
      }
    },
    options
  }
}
