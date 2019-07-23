import * as Yup from 'yup';
import { isBefore, parseISO } from 'date-fns';

import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class MeetupController {
  async index(req, res) {
    const meetups = await Meetup.findAll({
      where: { user_id: req.userId },
      attributes: ['id', 'title', 'description', 'date', 'location'],
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
    });

    return res.json(meetups);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
      banner_id: Yup.number().required(),
      user_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const parsedDate = parseISO(req.body.date);

    if (isBefore(parsedDate, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permited' });
    }

    const meetup = await Meetup.create(req.body);

    return res.json(meetup);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      location: Yup.string(),
      date: Yup.date(),
      banner_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    /**
     * Check if user is the owner
     */
    if (req.body.user_id !== req.userId) {
      return res.status(400).json({ error: 'User must be the owner' });
    }

    /**
     * Check if the meetup has past
     */
    if (isBefore(parseISO(req.body.date), new Date())) {
      return res.status(400).json({ error: 'Past dates are not permited' });
    }

    const meetup = await Meetup.findByPk(req.params.id);

    const { id, title, description, data, location } = await meetup.update(
      req.body
    );

    return res.json({ id, title, description, data, location });
  }
}
export default new MeetupController();
