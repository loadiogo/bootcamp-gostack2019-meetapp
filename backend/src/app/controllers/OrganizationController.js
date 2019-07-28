import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class OrganizationController {
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
}

export default new OrganizationController();
