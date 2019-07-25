import { isBefore, parseISO } from 'date-fns';

import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';
import User from '../models/User';

class SubscriptionController {
  async index(req, res) {
    return res.json({});
  }

  async create(req, res) {
    const meetup = await Meetup.findByPk(req.meetup_id, {
      attributes: ['id', 'title', 'description', 'date', 'location'],
      include: [
        {
          model: User,
          attributes: ['name', 'email'],
        },
      ],
    });

    /**
     * Check if user is the meetup owner
     */
    if (meetup.user_id === req.user_id) {
      return res
        .status(401)
        .json({ error: 'Cannot subscribe to owned meetups' });
    }

    /**
     * Check if the meetup has past
     */
    if (isBefore(parseISO(meetup.date), new Date())) {
      return res
        .status(400)
        .json({ error: 'Cannot subscribe to past meetups' });
    }

    const alreadySubscribed = await Subscription.findOne({
      where: {
        id: meetup.id,
        user_id: req.userId,
      },
    });

    if (alreadySubscribed) {
      return res.status(401).json({ error: 'User already subscribed!' });
    }

    const sameTimeMeetup = await Subscription.findOne({
      where: {
        user_id: req.userId,
        date: meetup.date,
      },
    });

    if (sameTimeMeetup) {
      return res.status(401).json({
        error: 'Cannot subscribe to a same date/time meetup, choose another',
      });
    }

    return res.json({});
  }
}

export default new SubscriptionController();
