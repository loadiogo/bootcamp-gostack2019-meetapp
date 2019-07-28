import { isBefore, parseISO } from 'date-fns';
import { Op } from 'sequelize';

import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';
import User from '../models/User';
import Queue from '../../lib/Queue';
import SubscriptionMail from '../jobs/SubscriptionMail';
import File from '../models/File';

class SubscriptionController {
  async index(req, res) {
    const subscriptions = await Subscription.findAll({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          required: true,
          where: {
            date: {
              [Op.gt]: new Date(),
            },
          },
          include: [
            {
              model: User,
              attributes: ['name', 'email'],
            },
            {
              model: File,
              attributes: ['name', 'path', 'url'],
            },
          ],
        },
        {
          model: User,
          as: 'subscriber',
          attributes: ['name', 'email'],
        },
      ],
    });

    return res.json(subscriptions);
  }

  async store(req, res) {
    const user = await User.findByPk(req.userId);
    const { meetupId } = req.params;
    const meetup = await Meetup.findByPk(meetupId, {
      include: [
        {
          model: User,
          attributes: ['name', 'email'],
        },
      ],
    });

    if (!meetup) {
      return res.status(400).json({ error: 'Meetup does not exist' });
    }

    /**
     * Check if user is the meetup owner
     */
    if (meetup.user_id === req.userId) {
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
        meetup_id: meetupId,
        user_id: req.userId,
      },
    });

    if (alreadySubscribed) {
      return res.status(401).json({ error: 'User already subscribed!' });
    }

    const sameTimeMeetup = await Subscription.findOne({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          required: true,
          where: {
            date: meetup.date,
          },
        },
      ],
    });

    if (sameTimeMeetup) {
      return res.status(401).json({
        error: 'Cannot subscribe to a same date/time meetup, choose another',
      });
    }

    const subscription = await Subscription.create({
      user_id: req.userId,
      meetup_id: meetupId,
    });

    await Queue.add(SubscriptionMail.key, {
      meetup,
      user,
    });

    return res.json(subscription);
  }
}

export default new SubscriptionController();
