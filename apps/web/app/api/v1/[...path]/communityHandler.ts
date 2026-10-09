import { NextRequest, NextResponse } from 'next/server'
import {
  TURKISH_COMMUNITIES,
  TURKISH_COMMUNITY_DISCUSSIONS,
} from '@services/demo/turkishSchoolData'

// In-memory communities store initialized from Turkish school data
let communitiesStore: any[] = [...TURKISH_COMMUNITIES]
let discussionsStore: Record<string, any[]> = { ...TURKISH_COMMUNITY_DISCUSSIONS }

function normalizeCommunityUuid(idOrUuid: string): string {
  if (!idOrUuid) return ''
  const trimmed = idOrUuid.trim()
  // Try direct match
  const direct = communitiesStore.find(
    (c) => c.community_uuid === trimmed || String(c.id) === trimmed
  )
  if (direct) return direct.community_uuid

  // Try stripping community_ or comm_
  const stripped = trimmed.replace(/^community_/, '').replace(/^comm_/, '')
  const matched = communitiesStore.find(
    (c) =>
      c.community_uuid === stripped ||
      c.community_uuid === `comm_${stripped}` ||
      c.community_uuid === `community_${stripped}` ||
      c.community_uuid.includes(stripped) ||
      stripped.includes(c.community_uuid)
  )
  return matched ? matched.community_uuid : trimmed
}

export async function handleCommunityApi(request: NextRequest, path: string): Promise<Response> {
  const method = request.method.toUpperCase()

  // 1. Communities list
  // Matches: /api/v1/communities, /api/v1/communities/, /api/v1/communities/org/:org_id/...
  if (
    path === '/api/v1/communities' ||
    path === '/api/v1/communities/' ||
    path.startsWith('/api/v1/communities/org/')
  ) {
    if (method === 'GET') {
      if (path.startsWith('/api/v1/communities/org/')) {
        const parts = path.split('/')
        const orgId = Number(parts[parts.indexOf('org') + 1])
        if (orgId) {
          return NextResponse.json(communitiesStore.filter(c => c.org_id === orgId), { status: 200 })
        }
      }
      return NextResponse.json(communitiesStore, { status: 200 })
    }

    if (method === 'POST') {
      try {
        const body = await request.json()
        const newId = communitiesStore.length + 1
        const newUuid = `comm_${Date.now()}`
        const newCommunity = {
          id: newId,
          community_uuid: newUuid,
          org_id: body.org_id || 30,
          name: body.name || 'Yeni Veli & Sınıf Topluluğu',
          description: body.description || '',
          public: body.public !== undefined ? body.public : true,
          is_active: body.is_active !== undefined ? body.is_active : true,
          moderation_words: [],
          moderation_settings: {
            allow_rich_content: true,
            block_links: false,
          },
          thumbnail_image: null,
          creation_date: new Date().toISOString(),
          update_date: new Date().toISOString(),
        }
        communitiesStore.unshift(newCommunity)
        discussionsStore[newUuid] = []
        return NextResponse.json(newCommunity, { status: 201 })
      } catch (err) {
        return NextResponse.json({ error: 'Failed to create community' }, { status: 400 })
      }
    }
  }

  // 2. Discussions for a community
  // Matches: /api/v1/communities/:uuid/discussions
  if (path.includes('/communities/') && path.endsWith('/discussions')) {
    const parts = path.split('/')
    const rawUuid = parts[parts.indexOf('communities') + 1] || ''
    const commUuid = normalizeCommunityUuid(rawUuid)

    if (method === 'GET') {
      const list = discussionsStore[commUuid] || discussionsStore['comm_1a_veli_dayanisma'] || []
      return NextResponse.json(list, { status: 200 })
    }

    if (method === 'POST') {
      try {
        const body = await request.json()
        const newDisc = {
          id: Date.now(),
          community_id: 1,
          org_id: 10,
          author_id: 301,
          discussion_uuid: `disc_${Date.now()}`,
          title: body.title,
          content: body.content || '',
          label: body.label || 'general',
          emoji: body.emoji || '💬',
          upvote_count: 0,
          edit_count: 0,
          is_pinned: false,
          is_locked: false,
          creation_date: new Date().toISOString(),
          update_date: new Date().toISOString(),
          author: {
            id: 301,
            user_uuid: 'usr_ebru_ugurlu',
            username: 'ebru.ugurlu',
            first_name: 'Ebru',
            last_name: 'UĞURLU',
            avatar_image: null,
          },
          has_voted: false,
          comments: [],
        }
        if (!discussionsStore[commUuid]) discussionsStore[commUuid] = []
        discussionsStore[commUuid].unshift(newDisc)
        return NextResponse.json(newDisc, { status: 201 })
      } catch (err) {
        return NextResponse.json({ error: 'Failed to create discussion' }, { status: 400 })
      }
    }
  }

  // 3. Community rights
  // Matches: /api/v1/communities/:uuid/rights
  if (path.includes('/communities/') && path.endsWith('/rights')) {
    const parts = path.split('/')
    const rawUuid = parts[parts.indexOf('communities') + 1] || ''
    const commUuid = normalizeCommunityUuid(rawUuid)
    return NextResponse.json(
      {
        community_uuid: commUuid,
        user_id: 1,
        is_anonymous: false,
        permissions: {
          read: true,
          create: true,
          update: true,
          delete: true,
          create_discussion: true,
        },
        ownership: {
          is_admin: true,
          is_maintainer_role: true,
        },
        access: {
          via_public: true,
          via_usergroups: [],
          has_usergroup_restriction: false,
        },
      },
      { status: 200 }
    )
  }

  // 4. Single community details / update / delete
  // Matches: /api/v1/communities/:uuid
  if (path.startsWith('/api/v1/communities/')) {
    const parts = path.split('/')
    const rawUuid = parts[parts.indexOf('communities') + 1] || ''
    const commUuid = normalizeCommunityUuid(rawUuid)
    const commIndex = communitiesStore.findIndex(
      (c) => c.community_uuid === commUuid || String(c.id) === commUuid
    )

    if (method === 'GET') {
      const found = commIndex !== -1 ? communitiesStore[commIndex] : communitiesStore[0]
      return NextResponse.json(found, { status: 200 })
    }

    if (method === 'PUT') {
      try {
        const body = await request.json()
        if (commIndex !== -1) {
          communitiesStore[commIndex] = {
            ...communitiesStore[commIndex],
            ...body,
            update_date: new Date().toISOString(),
          }
          return NextResponse.json(communitiesStore[commIndex], { status: 200 })
        }
        return NextResponse.json(body, { status: 200 })
      } catch (err) {
        return NextResponse.json({ error: 'Failed to update community' }, { status: 400 })
      }
    }

    if (method === 'DELETE') {
      if (commIndex !== -1) {
        communitiesStore.splice(commIndex, 1)
        delete discussionsStore[commUuid]
      }
      return NextResponse.json(
        { success: true, message: 'Topluluk başarıyla silindi' },
        { status: 200 }
      )
    }
  }

  // 5. Discussion Labels
  if (path === '/api/v1/discussions/labels') {
    return NextResponse.json(
      [
        { id: 'general', name: 'Genel Sohbet', color: '#6B7280', icon: 'MessageSquare' },
        { id: 'question', name: 'Soru & Cevap', color: '#EAB308', icon: 'HelpCircle' },
        { id: 'idea', name: 'Öneri & Fikir', color: '#8B5CF6', icon: 'Lightbulb' },
        { id: 'announcement', name: 'Resmi Duyuru', color: '#3B82F6', icon: 'Megaphone' },
        { id: 'showcase', name: 'Etkinlik & Paylaşım', color: '#10B981', icon: 'Star' },
      ],
      { status: 200 }
    )
  }

  // 6. Discussion comments / vote / detail
  if (path.startsWith('/api/v1/discussions/')) {
    const parts = path.split('/')
    const discUuid = parts[parts.indexOf('discussions') + 1] || ''

    // Comments: /api/v1/discussions/:uuid/comments
    if (path.endsWith('/comments')) {
      if (method === 'POST') {
        const body = await request.json()
        const newComment = {
          id: Date.now(),
          comment_uuid: `cmt_${Date.now()}`,
          content: body.content || '',
          creation_date: new Date().toISOString(),
          author: {
            id: 301,
            user_uuid: 'usr_ebru_ugurlu',
            username: 'ebru.ugurlu',
            first_name: 'Ebru',
            last_name: 'UĞURLU',
            avatar_image: null,
          },
        }

        // Find discussion and attach comment
        for (const list of Object.values(discussionsStore)) {
          const disc = list.find((d) => d.discussion_uuid === discUuid)
          if (disc) {
            if (!disc.comments) disc.comments = []
            disc.comments.push(newComment)
            break
          }
        }
        return NextResponse.json(newComment, { status: 201 })
      }
    }

    // Vote: /api/v1/discussions/:uuid/vote
    if (path.endsWith('/vote')) {
      for (const list of Object.values(discussionsStore)) {
        const disc = list.find((d) => d.discussion_uuid === discUuid)
        if (disc) {
          disc.upvote_count = (disc.upvote_count || 0) + 1
          disc.has_voted = true
          return NextResponse.json({ success: true, upvotes: disc.upvote_count }, { status: 200 })
        }
      }
      return NextResponse.json({ success: true, upvotes: 1 }, { status: 200 })
    }

    // Detail: /api/v1/discussions/:uuid
    for (const list of Object.values(discussionsStore)) {
      const disc = list.find((d) => d.discussion_uuid === discUuid)
      if (disc) {
        return NextResponse.json(disc, { status: 200 })
      }
    }
  }

  return NextResponse.json(communitiesStore, { status: 200 })
}
