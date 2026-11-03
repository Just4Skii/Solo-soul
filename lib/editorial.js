/**
 * Shared editorial rules for SSoul's public discovery feed and Facebook post.
 *
 * The aggregator still collects the full Durban/KZN set. This module decides
 * whether a listing is something a person could reasonably do independently
 * and whether it belongs in SSoul's curated edit.
 *
 * Rules are deliberately explainable: every decision returns a reason.
 */

const INCLUDED_CATEGORIES = new Set(['wellness', 'creative', 'food', 'outdoors', 'music', 'fitness', 'luxury', 'markets']);
const REVIEW_CATEGORIES = new Set(['social', 'learning']);

const HARD_EXCLUSIONS = [
  [/\b(networking|sales pitch|lead generation|b2b|business breakfast|business expo|trade show|showroom|product demonstration|demo day)\b/i, 'business networking or sales event'],
  [/\b(corporate|business)\s+(conference|event|networking|summit|seminar)\b/i, 'corporate event'],
  [/\b(conference|summit|symposium|seminar)\b/i, 'conference or seminar'],
  [/\b(leadership|job fair|career fair|recruitment|trade show|expo)\b/i, 'corporate or retail expo'],
  [/\b(worship|church service|consecration|prayer breakfast|religious service)\b/i, 'religious service'],
  [/\b(hirsch|showroom|product demonstration|appliance demo)\b/i, 'retail promotion'],
  [/\b(preschool|school information|open day|parents evening)\b/i, 'school event'],
];

const CREATIVE_LEARNING = /creative|art|paint|pottery|craft|writing|photography|workshop|talk|lecture|class|course|design/i;
const SOCIAL_FORMATS = /comedy|theatre|theater|play|performance|concert|festival|market|art|exhibition|dance|poetry|open mic|games|picnic|party|jol|show/i;
const BUSINESS_LEARNING = /business|entrepreneur|startup|strategy|finance|sales|investor|wealth|management|marketing/i;

function textOf(event) {
  return [event.title, event.description, event.venue, event.category].filter(Boolean).join(' ');
}

export function curateEvent(event) {
  const title = String(event.title || '');
  const description = String(event.description || '');
  const venue = String(event.venue || '');
  const category = String(event.category || 'social').toLowerCase();
  const text = textOf(event);

  for (const [pattern, reason] of HARD_EXCLUSIONS) {
    if (pattern.test(text)) {
      return { included: false, score: 0, reason: `excluded: ${reason}` };
    }
  }

  if (INCLUDED_CATEGORIES.has(category)) {
    return { included: true, score: 100, reason: `included: ${category} experience` };
  }

  if (REVIEW_CATEGORIES.has(category)) {
    if (category === 'learning' && BUSINESS_LEARNING.test(text) && !CREATIVE_LEARNING.test(text)) {
      return { included: false, score: 0, reason: 'excluded: business learning event' };
    }
    if (category === 'learning' && !CREATIVE_LEARNING.test(text)) {
      return { included: false, score: 0, reason: 'excluded: not a public creative or learning experience' };
    }
    if (category === 'social' && !SOCIAL_FORMATS.test(text)) {
      // Social events with no recognisable format are still allowed unless they
      // matched a hard exclusion above; this keeps local cultural events in.
      return { included: true, score: 70, reason: 'included: social listing (editorial review)' };
    }
    return { included: true, score: 80, reason: `included: ${category} experience` };
  }

  return { included: false, score: 0, reason: `excluded: unsupported category ${category}` };
}

export function annotateEvents(events) {
  return (events || []).map(event => ({ ...event, curation: curateEvent(event) }));
}
